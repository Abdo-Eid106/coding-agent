import { Module } from '@nestjs/common';
import { CreateSession } from './use-cases/create-session.use-case.js';
import { DeleteSession } from './use-cases/delete-session.use-case.js';
import { SessionController } from './sessions.controller.js';
import { ProvidersModule } from '../providers/providers.module.js';

@Module({
  imports: [ProvidersModule],
  providers: [CreateSession, DeleteSession],
  controllers: [SessionController],
})
export class SessionModule {}
