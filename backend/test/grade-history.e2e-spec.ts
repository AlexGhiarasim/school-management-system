import type { Server } from 'node:http';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

describe('Grade history (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const as = (role: keyof TestContext['token']) => ({
    Authorization: `Bearer ${context.token[role]}`,
  });

  beforeAll(async () => {
    context = await createTestContext('e2e-history');
  });

  afterAll(async () => {
    await context.close();
  });

  it('records who created, changed and deleted a grade', async () => {
    const created = await http()
      .post('/api/grades')
      .set(as('teacher'))
      .send({
        studentId: context.ids.ownStudent,
        subjectId: context.ids.subject,
        value: 6,
      })
      .expect(201);
    const gradeId = created.body.id as number;

    await http()
      .patch(`/api/grades/${gradeId}`)
      .set(as('admin'))
      .send({ value: 9 })
      .expect(200);
    await http().delete(`/api/grades/${gradeId}`).set(as('admin')).expect(204);

    const history = await http()
      .get(`/api/grades/${gradeId}/history`)
      .set(as('admin'))
      .expect(200);

    expect(history.body).toMatchObject([
      { action: 'DELETED', oldValue: 9, newValue: null },
      { action: 'UPDATED', oldValue: 6, newValue: 9 },
      {
        action: 'CREATED',
        oldValue: null,
        newValue: 6,
        studentName: 'Student Own',
        actor: { name: 'Test Teacher', role: 'TEACHER' },
      },
    ]);

    const log = await http()
      .get('/api/grades/history?action=DELETED&limit=100')
      .set(as('admin'))
      .expect(200);

    expect(
      log.body.data.some(
        (entry: { gradeId: number }) => entry.gradeId === gradeId,
      ),
    ).toBe(true);
  });

  it('keeps the history away from teachers and students', async () => {
    await http().get('/api/grades/history').set(as('teacher')).expect(403);
    await http().get('/api/grades/history').set(as('student')).expect(403);
  });
});
