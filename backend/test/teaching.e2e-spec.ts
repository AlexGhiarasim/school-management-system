import type { Server } from 'node:http';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

describe('Teaching assignments (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const as = (role: keyof TestContext['token']) => ({
    Authorization: `Bearer ${context.token[role]}`,
  });

  beforeAll(async () => {
    context = await createTestContext('e2e-teaching');
  });

  afterAll(async () => {
    await context.close();
  });

  it('lets a teacher grade a subject only while it is assigned to them', async () => {
    const subject = await context.prisma.subject.create({
      data: { name: 'e2e-teaching-extra' },
    });
    const teacherOf = (email: string) =>
      context.prisma.teacher.findFirstOrThrow({ where: { user: { email } } });
    const other = await teacherOf(context.email.otherTeacher);
    const first = await teacherOf(context.email.teacher);
    const teaching = `/api/classes/${context.ids.ownClass}/teaching`;
    const grade = {
      studentId: context.ids.ownStudent,
      subjectId: subject.id,
      value: 8,
    };

    await http()
      .post('/api/grades')
      .set(as('otherTeacher'))
      .send(grade)
      .expect(403);

    const assigned = await http()
      .post(teaching)
      .set(as('admin'))
      .send({ teacherId: other.id, subjectId: subject.id })
      .expect(201);

    await http()
      .post('/api/grades')
      .set(as('otherTeacher'))
      .send(grade)
      .expect(201);

    // A subject has one teacher in a class.
    await http()
      .post(teaching)
      .set(as('admin'))
      .send({ teacherId: first.id, subjectId: subject.id })
      .expect(409);

    const list = await http().get(teaching).set(as('admin')).expect(200);
    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: assigned.body.id,
          teacher: expect.objectContaining({ id: other.id }),
        }),
      ]),
    );

    await http()
      .delete(`${teaching}/${assigned.body.id}`)
      .set(as('admin'))
      .expect(204);
    await http()
      .post('/api/grades')
      .set(as('otherTeacher'))
      .send(grade)
      .expect(403);
  });

  it('keeps the assignments for administrators', async () => {
    const teaching = `/api/classes/${context.ids.ownClass}/teaching`;

    await http().get(teaching).set(as('teacher')).expect(403);
    await http()
      .post(teaching)
      .set(as('teacher'))
      .send({ teacherId: 1, subjectId: 1 })
      .expect(403);
  });
});
