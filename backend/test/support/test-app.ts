import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { hashPassword } from '../../src/common/utils/password.util.js';
import { PrismaService } from '../../src/database/prisma.service.js';
import { Role } from '../../src/generated/prisma/enums.js';

export const PASSWORD = 'Password123!';

export interface TestContext {
  app: INestApplication;
  prisma: PrismaService;
  email: Record<'admin' | 'teacher' | 'otherTeacher' | 'student', string>;
  token: Record<'admin' | 'teacher' | 'otherTeacher' | 'student', string>;
  ids: {
    ownClass: number;
    foreignClass: number;
    ownStudent: number;
    foreignStudent: number;
    subject: number;
  };
  close: () => Promise<void>;
}

export async function createTestContext(scope: string): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();

  const prisma = app.get(PrismaService);
  const jwt = app.get(JwtService);
  const passwordHash = await hashPassword(PASSWORD);
  const email = (name: string) => `${scope}-${name}@${scope}.test`;

  const createUser = (name: string, role: Role) =>
    prisma.user.create({
      data: { email: email(name), passwordHash, role },
    });

  const admin = await createUser('admin', Role.ADMIN);
  const teacherUser = await createUser('teacher', Role.TEACHER);
  const otherTeacherUser = await createUser('other-teacher', Role.TEACHER);
  const studentUser = await createUser('student', Role.STUDENT);
  const foreignStudentUser = await createUser('foreign-student', Role.STUDENT);

  const teacher = await prisma.teacher.create({
    data: { firstName: 'Test', lastName: 'Teacher', userId: teacherUser.id },
  });
  const otherTeacher = await prisma.teacher.create({
    data: {
      firstName: 'Other',
      lastName: 'Teacher',
      userId: otherTeacherUser.id,
    },
  });

  const ownClass = await prisma.class.create({
    data: { name: `${scope}-own`, teacherId: teacher.id },
  });
  const foreignClass = await prisma.class.create({
    data: { name: `${scope}-foreign`, teacherId: otherTeacher.id },
  });

  const ownStudent = await prisma.student.create({
    data: {
      firstName: 'Own',
      lastName: 'Student',
      dateOfBirth: new Date('2010-01-01'),
      userId: studentUser.id,
      classId: ownClass.id,
    },
  });
  const foreignStudent = await prisma.student.create({
    data: {
      firstName: 'Foreign',
      lastName: 'Student',
      dateOfBirth: new Date('2010-01-01'),
      userId: foreignStudentUser.id,
      classId: foreignClass.id,
    },
  });

  const subject = await prisma.subject.create({
    data: { name: `${scope}-subject` },
  });

  await prisma.teachingAssignment.create({
    data: {
      teacherId: teacher.id,
      classId: ownClass.id,
      subjectId: subject.id,
    },
  });

  const sign = (user: { id: number; email: string; role: Role }) =>
    jwt.signAsync({ sub: user.id, email: user.email, role: user.role });

  return {
    app,
    prisma,
    email: {
      admin: admin.email,
      teacher: teacherUser.email,
      otherTeacher: otherTeacherUser.email,
      student: studentUser.email,
    },
    token: {
      admin: await sign(admin),
      teacher: await sign(teacherUser),
      otherTeacher: await sign(otherTeacherUser),
      student: await sign(studentUser),
    },
    ids: {
      ownClass: ownClass.id,
      foreignClass: foreignClass.id,
      ownStudent: ownStudent.id,
      foreignStudent: foreignStudent.id,
      subject: subject.id,
    },
    close: async () => {
      await prisma.user.deleteMany({
        where: { email: { endsWith: `@${scope}.test` } },
      });
      await prisma.class.deleteMany({
        where: { name: { startsWith: `${scope}-` } },
      });
      await prisma.subject.deleteMany({
        where: { name: { startsWith: `${scope}-` } },
      });
      await app.close();
    },
  };
}
