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

  describe('account input validation', () => {
    const student = {
      firstName: 'Maria',
      lastName: 'Popescu',
      email: 'validation@e2e-access.test',
      password: 'Password123',
      dateOfBirth: '2010-05-17',
    };
    const create = (changes: Record<string, unknown>) =>
      http()
        .post('/api/students')
        .set('Authorization', as('admin'))
        .send({ ...student, ...changes });

    it('accepts a valid student and names with accents or hyphens', async () => {
      const response = await create({
        firstName: '??tefan-Ionu??',
        lastName: "O'Neill",
      }).expect(201);

      expect(response.body.firstName).toBe('??tefan-Ionu??');
    });

    it('lists only the students that are not in a class on request', async () => {
      await create({ email: 'unassigned@e2e-access.test' }).expect(201);

      const response = await http()
        .get('/api/students?unassigned=true&search=unassigned@e2e-access')
        .set('Authorization', as('admin'))
        .expect(200);

      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].class).toBeNull();
    });

    it('rejects names with digits, symbols or a single character', async () => {
      await create({ email: 'a@e2e-access.test', firstName: 'Maria1' }).expect(
        400,
      );
      await create({ email: 'b@e2e-access.test', lastName: '<script>' }).expect(
        400,
      );
      await create({ email: 'c@e2e-access.test', firstName: 'M' }).expect(400);
    });

    it('rejects passwords without a letter or a digit', async () => {
      await create({
        email: 'd@e2e-access.test',
        password: 'onlyletters',
      }).expect(400);
      await create({ email: 'e@e2e-access.test', password: '12345678' }).expect(
        400,
      );
    });

    it('rejects a password longer than 72 bytes', async () => {
      await create({
        email: 'h@e2e-access.test',
        password: `${'??'.repeat(37)}1`,
      }).expect(400);
    });

    it('rejects an email that is too long', async () => {
      const email = `${'a'.repeat(250)}@e2e-access.test`;

      await create({ email }).expect(400);
    });

    it('rejects a birth date in the future or before 1900', async () => {
      await create({
        email: 'f@e2e-access.test',
        dateOfBirth: '2999-01-01',
      }).expect(400);
      await create({
        email: 'g@e2e-access.test',
        dateOfBirth: '1800-01-01',
      }).expect(400);
    });
  });
});
