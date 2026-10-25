import type { Server } from 'node:http';
import request from 'supertest';
import {
  createTestContext,
  PASSWORD,
  type TestContext,
} from './support/test-app.js';

describe('Authentication (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);

  beforeAll(async () => {
    context = await createTestContext('e2e-auth');
  });

  afterAll(async () => {
    await context.close();
  });

  it('exposes a public health check', async () => {
    await http().get('/api/health').expect(200);
  });

  it('logs in with valid credentials and returns a usable token', async () => {
    const login = await http()
      .post('/api/auth/login')
      .send({ email: context.email.teacher.toUpperCase(), password: PASSWORD })
      .expect(200);

    expect(login.body.user.role).toBe('TEACHER');

    const me = await http()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(me.body.email).toBe(context.email.teacher);
    expect(me.body.profile.firstName).toBe('Test');
  });

  it('rejects a wrong password and an unknown email the same way', async () => {
    const wrongPassword = await http()
      .post('/api/auth/login')
      .send({ email: context.email.teacher, password: 'wrong-password' })
      .expect(401);
    const unknownEmail = await http()
      .post('/api/auth/login')
      .send({ email: 'nobody@e2e-auth.test', password: PASSWORD })
      .expect(401);

    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it('rejects a malformed login body', async () => {
    await http()
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' })
      .expect(400);
  });

  it('rejects requests without a token or with an invalid one', async () => {
    await http().get('/api/auth/me').expect(401);
    await http()
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
  });

  it('rejects the token of a deactivated account', async () => {
    await context.prisma.user.update({
      where: { email: context.email.student },
      data: { isActive: false },
    });

    await http()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${context.token.student}`)
      .expect(401);
  });

  describe('registration', () => {
    const account = {
      firstName: 'Maria',
      lastName: 'Popescu',
      email: 'Maria.Register@e2e-auth.test',
      password: 'Password123',
      dateOfBirth: '2010-05-17',
    };

    it('creates a student account and signs it in', async () => {
      const response = await http()
        .post('/api/auth/register')
        .send(account)
        .expect(201);

      expect(response.body.user).toMatchObject({
        email: 'maria.register@e2e-auth.test',
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
        .send({ ...account, email: 'a@e2e-auth.test', role: 'ADMIN' })
        .expect(400);
      await http()
        .post('/api/auth/register')
        .send({ ...account, email: 'b@e2e-auth.test', classId: 1 })
        .expect(400);
    });

    it('rejects invalid account data', async () => {
      await http()
        .post('/api/auth/register')
        .send({ ...account, email: 'c@e2e-auth.test', password: 'short' })
        .expect(400);
    });
  });
});
