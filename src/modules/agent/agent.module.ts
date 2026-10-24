import { Module } from '@nestjs/common';
import { ToolManager } from './providers/tool-manager.js';
import { AgentService } from './langchain/agent.service.js';
import { AgentEventsHandler } from './providers/agent.event-handler.js';
import { AgentGraphFactory } from './langchain/agent-graph.factory.js';
import { MessagesProjectionHandler } from './langchain/projections/messages-projection-handler.js';
import { ToolsProjectionHandler } from './langchain/projections/tools-projection-handler.js';
import { StreamCompletionHandler } from './langchain/projections/stream-completion-handler.js';
import { SessionModule } from '../sessions/sessions.module.js';
import { AgentConroller } from './agent.controller.js';

@Module({
  imports: [SessionModule],
  providers: [
    ToolManager,
    AgentService,
    AgentGraphFactory,
    AgentEventsHandler,
    MessagesProjectionHandler,
    ToolsProjectionHandler,
    StreamCompletionHandler,
  ],
  controllers: [AgentConroller],
  exports: [AgentService],
})
export class AgentModule {}
