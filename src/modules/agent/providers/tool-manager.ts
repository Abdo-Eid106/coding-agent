import { Injectable, OnModuleInit } from '@nestjs/common';
import type { StructuredToolInterface } from '@langchain/core/tools';

import { builtInTools } from '../tools/index.js';
import { McpService } from './mcp.service.js';

@Injectable()
export class ToolManager implements OnModuleInit {
  private tools: StructuredToolInterface[] = [...builtInTools];

  constructor(private readonly mcpService: McpService) {}

  async onModuleInit() {
    await this.reload();
  }

  async reload() {
    const mcpTools = await this.mcpService.getTools({ reload: true });
    this.tools = [...builtInTools, ...mcpTools];
  }

  getTools(): StructuredToolInterface[] {
    return this.tools;
  }

  getMcpServers() {
    return this.mcpService.getServers();
  }
}
