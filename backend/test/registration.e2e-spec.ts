import type { Server } from 'node:http';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

// Public registration is off by default, so this suite turns it on.
describe('Registration (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);

  beforeAll(async () => {
    context = await createTestContext('e2e-register');
    context.app.get(ConfigService).set('ALLOW_PUBLIC_REGISTRATION', true);
  });

  afterAll(async () => {
    context.app.get(ConfigService).set('ALLOW_PUBLIC_REGISTRATION', false);
    await context.close();
  });

  it('reports it in the public config', async () => {
    const response = await http().get('/api/auth/config').expect(200);

    expect(response.body).toEqual({ registrationEnabled: true });
  });

  const account = {
    firstName: 'Maria',
    lastName: 'Popescu',
    email: 'Maria.Register@e2e-register.test',
    password: 'Password123',
    dateOfBirth: '2010-05-17',
  };

  it('creates a student account and signs it in', async () => {
    const response = await http()
      .post('/api/auth/register')
      .send(account)
      .expect(201);

    expect(response.body.user).toMatchObject({
      email: 'maria.register@e2e-register.test',
      role: 'STUDENT',
    });

    const me = await http()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${response.body.accessToken}`)
      .expect(200);

    expect(me.body.profile.firstName).toBe('Maria');
  });

  it('rejects an email that is already registered', async () => {
    await http()
      .post('/api/auth/register')
      .send({ ...account, email: account.email.toUpperCase() })
      .expect(409);
  });

  it('does not accept a role or a class from the client', async () => {
    await http()
      .post('/api/auth/register')
      .send({ ...account, email: 'a@e2e-register.test', role: 'ADMIN' })
      .expect(400);
    await http()
      .post('/api/auth/register')
      .send({ ...account, email: 'b@e2e-register.test', classId: 1 })
      .expect(400);
  });

  it('rejects invalid account data', async () => {
    await http()
      .post('/api/auth/register')
      .send({ ...account, email: 'c@e2e-register.test', password: 'short' })
      .expect(400);
  });
});
