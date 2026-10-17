import { Test } from '@nestjs/testing';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GetMessages } from '../get-messages.use-case.js';
import { SessionFactory } from '../../../../database/factories/session.factory.js';
import { MessageFactory } from '../../../../database/factories/message.factory.js';
import { TestDatabaseModule } from '../../../../database/test-database.module.js';
import { Session } from '../../../../database/entities/session.entity.js';

const DEFAULT_LIMIT = 20;

describe('get messages use case (integration)', () => {
  let moduleRef: Awaited<
    ReturnType<ReturnType<typeof Test.createTestingModule>['compile']>
  >;
  let orm: MikroORM;
  let em: EntityManager;
  let useCase: GetMessages;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [GetMessages],
    }).compile();

    orm = moduleRef.get(MikroORM);
    em = moduleRef.get(EntityManager);
    useCase = moduleRef.get(GetMessages);
  });

  afterAll(async () => {
    await orm.close();
    await moduleRef.close();
  });

  beforeAll(async () => {
    await em.nativeDelete(Session, {});
  });

  it('should return the messages from the oldest to the newest', async () => {
    const messageIds = [
      '018cc251-f400-7a3b-9c5d-2e8f4b6a1d07',
      '018cc251-f401-7c4e-8b2a-5d9e3f1a6b08',
    ].sort();

    const session = new SessionFactory(em).makeOne();
    new MessageFactory(em).makeOne({
      session,
      id: messageIds[0],
    });
    new MessageFactory(em).makeOne({
      session,
      id: messageIds[1],
    });
    await em.flush();

    const result = await useCase.execute(session.id, {});

    const [first, second] = result.items;
    expect(first.id).toEqual(messageIds[0]);
    expect(second.id).toBe(messageIds[1]);
  });

  it('should return undefined cursor when there is no more data', async () => {
    const session = new SessionFactory(em).makeOne();
    new MessageFactory(em).makeOne({
      session,
    });
    await em.flush();

    const result = await useCase.execute(session.id, {});

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeUndefined();
  });

  it('should return cursor when there is more data', async () => {
    const session = new SessionFactory(em).makeOne();
    new MessageFactory(em).make(21, {
      session,
    });
    await em.flush();

    const result = await useCase.execute(session.id, {});

    expect(result.items).toHaveLength(DEFAULT_LIMIT);
    expect(result.nextCursor).toBeDefined();
  });

  // it('should return the correct cursor', async () => {
  //   const session = new SessionFactory(em).makeOne();
  //   new MessageFactory(em).make(21, {
  //     session,
  //   });
  //   await em.flush();

  //   const result = await useCase.execute(session.id, {});
  //   const result2 = await useCase.execute(session.id, {
  //     cursor: result.items.at(0)!.id,
  //   });

  //   expect(result.nextCursor).toBe(result2.items[1].id);
  // });
});
