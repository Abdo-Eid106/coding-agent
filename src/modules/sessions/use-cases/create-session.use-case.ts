import { EntityManager } from '@mikro-orm/core';
import { Session } from '../../../database/entities/session.entity.js';
import { Project } from '../../../database/entities/project.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from '../dto/create-session.dto.js';
import { GetModel } from '../../providers/use-cases/get-model.use-case.js';
import { createModel } from '../../agent/create-model.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';

const TITLE_SYSTEM_PROMPT =
  "Generate a short title (max 6 words) for a chat that starts with the user's message. " +
  'Reply with the title only: no quotes, no punctuation at the end, no markdown.';

@Injectable()
export class CreateSession {
  constructor(
    private readonly em: EntityManager,
    private readonly getModel: GetModel,
  ) {}

  async execute(dto: CreateSessionDto) {
    const { projectId, messageId, messageContent, modelId } = dto;

    const project = projectId ? await this.findProject(projectId) : null;
    const title = await this.generateTitle(modelId, messageContent);

    const session = this.em.create(Session, { title, project });
    const message = this.em.create(Message, {
      session,
      id: messageId,
      content: messageContent,
      role: MessageRole.USER,
    });

    await this.em.flush();
    return session;
  }

  private async findProject(projectId: string) {
    const project = await this.em.findOne(Project, { id: projectId });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async generateTitle(modeId: string, messageContent: string) {
    const aiModel = await this.getModel.execute(modeId);
    const provider = aiModel.provider;

    const model = createModel({
      model: aiModel.id,
      provider: provider.name,
      apiKey: provider.apiKey!,
      baseUrl: provider.baseUrl,
    });

    const response = await model.invoke([
      new SystemMessage(TITLE_SYSTEM_PROMPT),
      new HumanMessage(messageContent),
    ]);

    const title =
      typeof response.content === 'string'
        ? response.content.trim()
        : response.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('')
            .trim();

    return title;
  }
}
