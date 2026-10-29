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

  describe('registration when it is disabled (the default)', () => {
    it('reports it in the public config', async () => {
      const response = await http().get('/api/auth/config').expect(200);

      expect(response.body).toEqual({ registrationEnabled: false });
    });

    it('refuses to create an account', async () => {
      await http()
        .post('/api/auth/register')
        .send({
          firstName: 'Maria',
          lastName: 'Popescu',
          email: 'closed@e2e-auth.test',
          password: 'Password123',
          dateOfBirth: '2010-05-17',
        })
        .expect(403);
    });
  });
});
