import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { MCPAdapter } from '@langchain/mcp-adapters';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { builtInTools } from '../tools/index.js';
import { Injectable, OnModuleInit } from '@nestjs/common';

const configPath = path.resolve(process.cwd(), 'config/mcp.json');

interface McpServerConfig {
  [serverName: string]: any;
}

@Injectable()
export class ToolManager implements OnModuleInit {
  private tools: StructuredToolInterface[] = [];

  private namespaceTools(
    tools: StructuredToolInterface[],
    prefix: string,
  ): StructuredToolInterface[] {
    return tools.map((tool) => {
      const name = tool.name.startsWith(`${prefix}_`)
        ? tool.name
        : `${prefix}_${tool.name}`;

      return tool;
    });
  }

  async init() {
    const rawConfig = await readFile(configPath, 'utf8');
    const config: { servers: McpServerConfig } = JSON.parse(rawConfig);
    const mcpTools: StructuredToolInterface[] = [...builtInTools];

    for (const [serverName, serverOptions] of Object.entries(config.servers)) {
      const adapter = new MCPAdapter({
        servers: { [serverName]: serverOptions },
      });

      const serverTools = await adapter.listTools();
      const namespacedServerTools = this.namespaceTools(
        serverTools,
        serverName,
      );

      mcpTools.push(...namespacedServerTools);
    }

    this.tools = mcpTools;
  }

  async getTools(): Promise<StructuredToolInterface[]> {
    return this.tools;
  }

  async onModuleInit() {
    await this.init();
  }
}

export const toolManager = new ToolManager();
await toolManager.init();
