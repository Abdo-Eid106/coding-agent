import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { Injectable } from '@nestjs/common';
import { MCPAdapter } from '@langchain/mcp-adapters';
import type { StructuredToolInterface } from '@langchain/core/tools';

const configPath = path.resolve(process.cwd(), 'config/mcp.json');

export interface McpToolInfo {
  name: string;
  displayName: string;
}

export interface McpServerInfo {
  name: string;
  status: 'connected' | 'failed';
  tools: McpToolInfo[];
}

@Injectable()
export class McpService {
  private tools: StructuredToolInterface[] = [];
  private servers: McpServerInfo[] = [];

  async reload(): Promise<void> {
    this.tools = [];
    this.servers = [];

    try {
      const rawConfig = await readFile(configPath, 'utf8');
      const config = JSON.parse(rawConfig);

      const adapter = new MCPAdapter({
        servers: config.servers,
        prefixToolNameWithServerName: true,
      });

      const [tools, toolsets] = await Promise.all([
        adapter.listTools(),
        adapter.listToolsets(),
      ]);

      this.tools = tools;
      this.servers = Object.entries(toolsets).map(([name, serverTools]) => ({
        name,
        status: 'connected',
        tools: serverTools.map((tool) => ({
          name: tool.name,
          displayName: tool.name.replace(`${name}_`, ''),
        })),
      }));
    } catch {}
  }

  async getTools({ reload = false }: { reload: boolean }) {
    if (reload) await this.reload();
    return this.tools;
  }

  getServers(): McpServerInfo[] {
    return this.servers;
  }
}
