import type { Server } from 'node:http';
import request from 'supertest';
import {
  createTestContext,
  PASSWORD,
  type TestContext,
} from './support/test-app.js';

describe('Imports (e2e)', () => {
  let context: TestContext;
  const http = () => request(context.app.getHttpServer() as Server);
  const asAdmin = { Authorization: '' };
  const students = [
    'Nume;Prenume;Email;Data nașterii;Clasa',
    'Popescu;Maria;maria@e2e-import.test;17.05.2010;e2e-import-own',
    'Ionescu;Andrei;not-an-email;2010-11-02;e2e-import-own',
    'Stan;Ioana;ioana@e2e-import.test;2010-02-30;missing-class',
  ].join('\n');

  beforeAll(async () => {
    context = await createTestContext('e2e-import');
    asAdmin.Authorization = `Bearer ${context.token.admin}`;
  });

  afterAll(async () => {
    await context.close();
  });

  it('shows what would happen and saves nothing', async () => {
    const response = await http()
      .post('/api/imports/students/preview')
      .set(asAdmin)
      .send({ content: students })
      .expect(201);

    expect(response.body).toMatchObject({ total: 3, valid: 1, invalid: 2 });
    expect(response.body.rows[1].errors).toEqual([
      { field: 'email', code: 'email' },
    ]);
    expect(response.body.rows[2].errors).toEqual(
      expect.arrayContaining([
        { field: 'dateOfBirth', code: 'date' },
        { field: 'className', code: 'classNotFound' },
      ]),
    );
    expect(
      await context.prisma.user.count({
        where: { email: 'maria@e2e-import.test' },
      }),
    ).toBe(0);
  });

  it('imports the valid rows with a password the account can use', async () => {
    const response = await http()
      .post('/api/imports/students')
      .set(asAdmin)
      .send({ content: students })
      .expect(201);

    expect(response.body).toMatchObject({ created: 1, skipped: 2 });
    expect(response.body.accounts).toEqual([
      expect.objectContaining({ email: 'maria@e2e-import.test' }),
    ]);

    await http()
      .post('/api/auth/login')
      .send({
        email: 'maria@e2e-import.test',
        password: response.body.accounts[0].password,
      })
      .expect(200);

    // The same file again: the account exists now.
    const again = await http()
      .post('/api/imports/students/preview')
      .set(asAdmin)
      .send({ content: students })
      .expect(201);

    expect(again.body.rows[0].errors).toEqual([
      { field: 'email', code: 'taken' },
    ]);
  });

  it('makes an imported teacher the class teacher of a free class', async () => {
    const free = await context.prisma.class.create({
      data: { name: 'e2e-import-free' },
    });

    await http()
      .post('/api/imports/teachers')
      .set(asAdmin)
      .send({
        content:
          'Nume,Prenume,Email,Diriginte la clasa,Parola\n' +
          `Dumitrescu,Elena,elena@e2e-import.test,e2e-import-free,${PASSWORD}`,
      })
      .expect(201);

    const updated = await context.prisma.class.findUniqueOrThrow({
      where: { id: free.id },
      include: { teacher: { include: { user: true } } },
    });

    expect(updated.teacher?.user.email).toBe('elena@e2e-import.test');
  });

  it('reports a file without the needed columns and keeps it away from teachers', async () => {
    const response = await http()
      .post('/api/imports/students/preview')
      .set(asAdmin)
      .send({ content: 'Nume;Prenume\nPopescu;Maria' })
      .expect(201);

    expect(response.body.fileError).toEqual({
      code: 'missingColumns',
      columns: ['email', 'dateOfBirth'],
    });

    await http()
      .post('/api/imports/students/preview')
      .set({ Authorization: `Bearer ${context.token.teacher}` })
      .send({ content: students })
      .expect(403);
  });
});
