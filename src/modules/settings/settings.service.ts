import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AgentSettings } from '../../database/entities/agent-settings.entity.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly em: EntityManager) {}

  async get() {
    const existing = await this.em.find(AgentSettings, {});
    if (existing.length) return existing[0];

    const settings = this.em.create(AgentSettings, {});
    await this.em.flush();

    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();

    this.em.assign(settings, dto);
    await this.em.flush();
  }
}
