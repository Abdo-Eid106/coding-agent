import { Module, ValidationPipe } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/projects/projects.module.js';
import { SessionModule } from './modules/sessions/sessions.module.js';
import { MessagesModule } from './modules/messages/messages.module.js';
import { ProvidersModule } from './modules/providers/providers.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentModule } from './modules/agent/agent.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { cwd } from 'process';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProjectModule,
    SessionModule,
    MessagesModule,
    ProvidersModule,
    EventEmitterModule.forRoot({}),
    AgentModule,
    SettingsModule,
    ServeStaticModule.forRoot({ rootPath: join(cwd(), 'frontend') }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useValue: new ValidationPipe({ transform: true }) },
  ],
})
export class AppModule {}
