import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { SettingsService } from '../../settings/settings.service.js';

import { Session } from '../../../database/entities/session.entity.js';
import { Project } from '../../../database/entities/project.entity.js';
import {
  Message,
  MessageRole,
} from '../../../database/entities/message.entity.js';

import { CreateSessionDto } from '../dto/create-session.dto.js';
import { GetModel } from '../../providers/use-cases/get-model.use-case.js';
import { ModelFactory } from '../../agent/factories/model-factory.js';
import { AppEvent } from '../../agent/enums/app-events.enum.js';

const TITLE_SYSTEM_PROMPT =
  "Generate a short title (max 6 words) for a chat that starts with the user's message. " +
  'Reply with the title only: no quotes, no punctuation at the end, no markdown.';

@Injectable()
export class CreateSession {
  private readonly logger = new Logger(CreateSession.name);

  constructor(
    private readonly em: EntityManager,
    private readonly getModel: GetModel,
    private readonly eventEmitter: EventEmitter2,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(dto: CreateSessionDto) {
    const { projectId, messageId, messageContent, modelId } = dto;
    const project = projectId ? await this.findProject(projectId) : null;

    const session = this.em.create(Session, {
      title: this.createFallbackTitle(messageContent),
      project,
    });

    const settings = await this.settingsService.get();
    const message = this.em.create(Message, {
      session,
      id: messageId,
      content: messageContent,
      role: MessageRole.USER,
      modelId,
      commandApprovalMode: settings.commandApprovalMode,
    });

    await this.em.flush();

    this.eventEmitter.emit(AppEvent.AGENT_RUN_REQUESTED, {
      messageId: message.id,
    });

    void this.generateAndUpdateTitle(session.id, modelId, messageContent);

    return session;
  }

  private async findProject(projectId: string) {
    const project = await this.em.findOne(Project, {
      id: projectId,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private createFallbackTitle(content: string) {
    const title = content.trim().split(/\s+/).slice(0, 6).join(' ');
    return title.length > 0 ? title : 'New Chat';
  }

  private async generateAndUpdateTitle(
    sessionId: string,
    modelId: string,
    messageContent: string,
  ) {
    try {
      const aiModel = await this.getModel.execute(modelId);
      const provider = aiModel.provider;

      const model = ModelFactory({
        modelId: aiModel.id,
        apiKey: provider.apiKey!,
        baseUrl: provider.baseUrl,
        provider: aiModel.provider.id,
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

      const em = this.em.fork();
      const session = await em.findOne(Session, {
        id: sessionId,
      });
      if (!session) return;
      session.title = title;

      await em.flush();
    } catch (err) {
      this.logger.warn(err);
    }
  }
}
