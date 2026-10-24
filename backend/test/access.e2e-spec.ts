import type { Server } from 'node:http';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

describe('Access control and grading (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const as = (role: keyof TestContext['token']) =>
    `Bearer ${context.token[role]}`;

  beforeAll(async () => {
    context = await createTestContext('e2e-access');
  });

  afterAll(async () => {
    await context.close();
  });

  describe('role restrictions', () => {
    it('requires authentication on protected routes', async () => {
      await http().get('/api/students').expect(401);
    });

    it('keeps management routes closed to students', async () => {
      await http()
        .get('/api/students')
        .set('Authorization', as('student'))
        .expect(403);
      await http()
        .get('/api/teachers')
        .set('Authorization', as('student'))
        .expect(403);
      await http()
        .post('/api/subjects')
        .set('Authorization', as('student'))
        .send({ name: 'Blocked' })
        .expect(403);
    });

    it('keeps management routes closed to teachers', async () => {
      await http()
        .post('/api/classes')
        .set('Authorization', as('teacher'))
        .send({ name: 'Blocked' })
        .expect(403);
      await http()
        .get('/api/students')
        .set('Authorization', as('teacher'))
        .expect(403);
    });

    it('keeps teacher and student routes closed to other roles', async () => {
      await http()
        .get('/api/teachers/me/classes')
        .set('Authorization', as('admin'))
        .expect(403);
      await http()
        .get('/api/students/me')
        .set('Authorization', as('teacher'))
        .expect(403);
      await http()
        .get('/api/grades/me')
        .set('Authorization', as('teacher'))
        .expect(403);
    });

    it('lets a teacher see only the students of their own class', async () => {
      const own = await http()
        .get(`/api/classes/${context.ids.ownClass}/students`)
        .set('Authorization', as('teacher'))
        .expect(200);

      expect(own.body.meta.total).toBe(1);

      await http()
        .get(`/api/classes/${context.ids.foreignClass}/students`)
        .set('Authorization', as('teacher'))
        .expect(403);
    });

    it('lists the classes of the authenticated teacher', async () => {
      const response = await http()
        .get('/api/teachers/me/classes')
        .set('Authorization', as('teacher'))
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(context.ids.ownClass);
    });
  });

  describe('grades', () => {
    const grade = (studentId: number, value = 9) => ({
      studentId,
      subjectId: context.ids.subject,
      value,
    });

    it('lets a teacher grade a student from their own class', async () => {
      const response = await http()
        .post('/api/grades')
        .set('Authorization', as('teacher'))
        .send(grade(context.ids.ownStudent))
        .expect(201);

      expect(response.body.teacher.firstName).toBe('Test');
    });

    it('stops a teacher from grading a student of another class', async () => {
      await http()
        .post('/api/grades')
        .set('Authorization', as('teacher'))
        .send(grade(context.ids.foreignStudent))
        .expect(403);
    });

    it('rejects invalid values and unknown fields', async () => {
      await http()
        .post('/api/grades')
        .set('Authorization', as('teacher'))
        .send(grade(context.ids.ownStudent, 11))
        .expect(400);
      await http()
        .post('/api/grades')
        .set('Authorization', as('teacher'))
        .send({ ...grade(context.ids.ownStudent), teacherId: 1 })
        .expect(400);
    });

    it('stops a teacher from editing a grade given by an admin', async () => {
      const adminGrade = await http()
        .post('/api/grades')
        .set('Authorization', as('admin'))
        .send(grade(context.ids.ownStudent, 6))
        .expect(201);

      await http()
        .patch(`/api/grades/${adminGrade.body.id}`)
        .set('Authorization', as('teacher'))
        .send({ value: 10 })
        .expect(403);
    });

    it('shows a student only their own grades and average', async () => {
      await http()
        .get('/api/grades')
        .set('Authorization', as('student'))
        .expect(403);

      const response = await http()
        .get('/api/grades/me')
        .set('Authorization', as('student'))
        .expect(200);

      const values = response.body.grades.map(
        (item: { value: number }) => item.value,
      );
      expect(values.length).toBeGreaterThanOrEqual(2);
      expect(response.body.average).toBe(
        Math.round(
          (values.reduce((a: number, b: number) => a + b, 0) / values.length) *
            100,
        ) / 100,
      );
    });

    it('limits the grade list of a teacher to their own students', async () => {
      const response = await http()
        .get('/api/grades')
        .set('Authorization', as('otherTeacher'))
        .expect(200);

      expect(response.body.meta.total).toBe(0);

      await http()
        .get(`/api/grades?studentId=${context.ids.ownStudent}`)
        .set('Authorization', as('otherTeacher'))
        .expect(403);
    });
  });
});
