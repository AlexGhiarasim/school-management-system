import type { Server } from 'node:http';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

// In the test data, "teacher" leads the own class and "otherTeacher" the foreign one.
describe('Class teacher (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const as = (role: keyof TestContext['token']) => ({
    Authorization: `Bearer ${context.token[role]}`,
  });

  beforeAll(async () => {
    context = await createTestContext('e2e-homeroom');
  });

  afterAll(async () => {
    await context.close();
  });

  it('shows the class teacher the overview of the class', async () => {
    const response = await http()
      .get(`/api/classes/${context.ids.ownClass}/overview`)
      .set(as('teacher'))
      .expect(200);

    expect(response.body).toMatchObject({
      id: context.ids.ownClass,
      statistics: { totals: { students: 1 } },
      students: [{ studentId: context.ids.ownStudent, grades: 0 }],
    });
  });

  it('keeps the overview and the export away from everyone else', async () => {
    const overview = `/api/classes/${context.ids.ownClass}/overview`;
    const exportOwn = `/api/grades/export?classId=${context.ids.ownClass}`;

    await http().get(overview).set(as('otherTeacher')).expect(403);
    await http().get(overview).set(as('student')).expect(403);
    await http().get(exportOwn).set(as('otherTeacher')).expect(403);
    await http().get('/api/grades/export').set(as('teacher')).expect(403);
  });

  it('lets the class teacher export the grades of the class', async () => {
    await http()
      .get(`/api/grades/export?classId=${context.ids.ownClass}`)
      .set(as('teacher'))
      .expect(200)
      .expect('Content-Type', /text\/csv/);
  });
});
