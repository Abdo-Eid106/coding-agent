import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { MCPAdapter } from '@langchain/mcp-adapters';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { builtInTools } from '../tools/index.js';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

const configPath = path.resolve(process.cwd(), 'config/mcp.json');

interface McpServerConfig {
  [serverName: string]: any;
}

@Injectable()
export class ToolManager implements OnModuleInit, OnModuleDestroy {
  private tools: StructuredToolInterface[] = [];
  private adapter?: MCPAdapter;

  async init() {
    const rawConfig = await readFile(configPath, 'utf8');
    const config: { servers: McpServerConfig } = JSON.parse(rawConfig);

    this.adapter = new MCPAdapter({
      servers: config.servers,
      prefixToolNameWithServerName: true,
    });

    const mcpTools = await this.adapter.listTools();
    this.tools = [...builtInTools, ...mcpTools];
  }

  async getTools(): Promise<StructuredToolInterface[]> {
    return this.tools;
  }

  async onModuleInit() {
    await this.init();
  }

  async onModuleDestroy() {
    await this.adapter?.close();
  }
}
