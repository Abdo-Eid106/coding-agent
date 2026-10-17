import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Provider } from '../entities/provider.entity.js';
import { AIModel } from '../entities/ai-model.entity.js';

enum ProviderEnum {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export class ProviderSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const providers = await em.find(Provider, {});

    Object.values(ProviderEnum).map(async (value) => {
      const provider = providers.find((provider) => provider.name == value);
      if (provider) return;
      em.create(Provider, { name: value, id: value });
    });

    const modelId = 'gemini-flash-3.5';
    const model = await em.findOne(AIModel, {
      id: modelId,
    });

    if (!model) {
      em.create(AIModel, { id: modelId, name: modelId, provider: 'gemini' });
    }

    await em.flush();
  }
}
