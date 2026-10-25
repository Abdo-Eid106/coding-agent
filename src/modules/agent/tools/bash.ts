import { tool } from '@langchain/core/tools';
import {
  END,
  interrupt,
  START,
  StateGraph,
  StateSchema,
} from '@langchain/langgraph';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import z from 'zod';
import { classifyCommand, CommandDecision } from './classify-command.js';
import { CommandApprovalMode } from '../../settings/enums/command-approval-mode.js';
import { AgentGraphContext } from '../providers/agent-service/agent-graph.factory.js';

const execAsync = promisify(exec);

export interface BashOptions {
  command: string;
  cwd: string;
  timeout?: number | undefined;
  maxOutputLength?: number | undefined;
  shell?: string | undefined;
  env?: NodeJS.ProcessEnv | undefined;
  signal?: AbortSignal;
}

export interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function bash({
  command,
  cwd,
  timeout = 30_000,
  maxOutputLength = 10_000,
  shell,
  env,
  signal,
}: BashOptions): Promise<BashResult> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
      shell,
      signal,
      env: {
        ...process.env,
        ...env,
      },
    });

    return {
      stdout: stdout.slice(-maxOutputLength),
      stderr: stderr.slice(-maxOutputLength),
      exitCode: 0,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    const err = error as Error & {
      code?: number;
      stdout?: string;
      stderr?: string;
    };

    return {
      stdout: (err.stdout ?? '').slice(-maxOutputLength),
      stderr: (err.stderr ?? '').slice(-maxOutputLength),
      exitCode: typeof err.code === 'number' ? err.code : 1,
    };
  }
}

const AVAILABLE_OPTIONS = [
  {
    id: 'opt_approve',
    label: 'Approve and execute command',
    decision: CommandDecision.ALLOW,
  },
  {
    id: 'opt_reject',
    label: 'Reject command',
    decision: CommandDecision.DENY,
  },
] as const;

const bashResultSchema = z.object({
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number(),
});

const BashState = new StateSchema({
  command: z.string(),
  cwd: z.string(),
  timeout: z.number().optional(),
  maxOutputLength: z.number().optional(),
  shell: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  status: z.enum(CommandDecision).optional(),
  result: bashResultSchema.optional(),
});

export const bashGraph = new StateGraph(BashState)
  .addNode('classify', async (state, config) => {
    const context = config.context as AgentGraphContext;
    const mode = context.commandApprovalMode;
    const decision = classifyCommand(state.command);

    if (decision == CommandDecision.DENY) {
      return { status: decision };
    }

    if (
      mode == CommandApprovalMode.NEVER_ASK ||
      (mode == CommandApprovalMode.ASK_UNLESS_ALLOWLISTED &&
        decision == CommandDecision.ALLOW)
    ) {
      return { status: CommandDecision.ALLOW };
    }

    const response = interrupt({
      message: `Permission requested to execute sensitive command: "${state.command}"`,
      options: AVAILABLE_OPTIONS,
    }) as { selectedId?: string };

    const matchedOption = AVAILABLE_OPTIONS.find(
      (opt) => opt.id === response?.selectedId,
    );
    if (!matchedOption) {
      throw new Error(
        `Invalid option ID received: "${response?.selectedId}". Allowed IDs: ${AVAILABLE_OPTIONS.map((o) => o.id).join(', ')}`,
      );
    }

    return {
      status: matchedOption.decision,
    };
  })
  .addNode('execute', async (state, config) => {
    const result = await bash({
      command: state.command,
      cwd: state.cwd,
      timeout: state.timeout,
      maxOutputLength: state.maxOutputLength,
      shell: state.shell,
      env: state.env,
      signal: config.signal,
    });

    return { result };
  })
  .addEdge(START, 'classify')
  .addConditionalEdges(
    'classify',
    (state) => (state.status === CommandDecision.ALLOW ? 'execute' : END),
    {
      execute: 'execute',
      [END]: END,
    },
  )
  .addEdge('execute', END)
  .compile();

export const bashTool = tool(
  async (input, config) => {
    const state = await bashGraph.invoke(input, config);

    if (state.status === CommandDecision.DENY) {
      return JSON.stringify({
        stdout: '',
        stderr: `Command execution denied: "${input.command}"`,
        exitCode: 1,
      });
    }

    return JSON.stringify(state.result);
  },
  {
    name: 'bash',
    description:
      'Executes a shell command in a specified directory and returns stdout, stderr, and exitCode.',
    schema: z.object({
      command: z.string().describe('The shell command to execute.'),
      cwd: z.string().describe('The working directory to run the command in.'),
      timeout: z
        .number()
        .optional()
        .describe(
          'Maximum execution time in milliseconds (defaults to 30000).',
        ),
      maxOutputLength: z
        .number()
        .optional()
        .describe(
          'Maximum character length for stdout/stderr (defaults to 10000).',
        ),
      shell: z
        .string()
        .optional()
        .describe(
          "Path to custom shell binary (e.g., '/bin/bash' or '/bin/sh').",
        ),
      env: z
        .record(z.string(), z.string())
        .optional()
        .describe('Additional environment variables to pass to the process.'),
    }),
  },
);
