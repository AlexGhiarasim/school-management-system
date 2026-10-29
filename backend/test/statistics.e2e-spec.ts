import type { Server } from 'node:http';
import request from 'supertest';
import { createTestContext, type TestContext } from './support/test-app.js';

describe('Statistics and export (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const as = (role: keyof TestContext['token']) => ({
    Authorization: `Bearer ${context.token[role]}`,
  });

  beforeAll(async () => {
    context = await createTestContext('e2e-stats');

    await context.prisma.grade.createMany({
      data: [
        { value: 4, date: new Date('2026-09-16') },
        { value: 3, date: new Date('2026-09-23') },
      ].map((grade) => ({
        ...grade,
        studentId: context.ids.ownStudent,
        subjectId: context.ids.subject,
      })),
    });
  });

  afterAll(async () => {
    await context.close();
  });

  it('describes one class and flags its failing student', async () => {
    const response = await http()
      .get(`/api/statistics?classId=${context.ids.ownClass}`)
      .set(as('admin'))
      .expect(200);

    expect(response.body).toMatchObject({
      totals: { students: 1, gradedStudents: 1, grades: 2 },
      passRate: 0,
      byClass: [{ classId: context.ids.ownClass, average: 4, students: 1 }],
      trend: [
        { weekStart: '2026-09-14', average: 4, grades: 1 },
        { weekStart: '2026-09-21', average: 3, grades: 1 },
      ],
      atRisk: [
        {
          studentId: context.ids.ownStudent,
          failingSubjects: [{ subject: 'e2e-stats-subject', average: 4 }],
        },
      ],
    });
  });

  it('keeps the statistics for administrators', async () => {
    await http().get('/api/statistics').set(as('teacher')).expect(403);
    await http().get('/api/statistics').set(as('student')).expect(403);
  });

  it('downloads the grades of a class as CSV', async () => {
    const response = await http()
      .get(`/api/grades/export?classId=${context.ids.ownClass}&language=en`)
      .set(as('admin'))
      .expect(200)
      .expect('Content-Type', /text\/csv/)
      .expect('Content-Disposition', /attachment; filename="grades.csv"/);

    const lines = response.text.trimEnd().split('\r\n');

    expect(lines[0]).toBe('﻿Date,Class,Student,Subject,Grade,Teacher');
    expect(lines.slice(1)).toEqual([
      `2026-09-23,e2e-stats-own,Student Own,e2e-stats-subject,3,`,
      `2026-09-16,e2e-stats-own,Student Own,e2e-stats-subject,4,`,
    ]);
  });
});
