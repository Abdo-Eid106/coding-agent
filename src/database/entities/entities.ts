import { AIModel } from './ai-model.entity.js';
import { Message } from './message.entity.js';
import { Project } from './project.entity.js';
import { Provider } from './provider.entity.js';
import { Session } from './session.entity.js';
import { ToolCall } from './tool-call.entity.js';
import { AgentSettings } from './agent-settings.entity.js';

export const entities = [
  AIModel,
  Message,
  Project,
  Provider,
  Session,
  ToolCall,
  AgentSettings,
];
