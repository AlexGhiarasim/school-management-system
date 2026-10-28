import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { parseDatabaseUrl } from '../src/database/database-url.js';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import {
  ADMINS,
  CLASS_PLANS,
  FIRST_NAMES,
  LAST_NAMES,
  STUDENTS_PER_CLASS,
  SUBJECT_OVERRIDES,
  SUBJECT_TEACHERS,
  SUBJECTS,
  TEACHER_COUNT,
  UNASSIGNED_STUDENTS,
} from './seed-data.js';

config({ path: '../.env', quiet: true });

const PASSWORDS = {
  admin: 'Admin123!',
  teacher: 'Teacher123!',
  student: 'Student123!',
};

const GRADES_PER_SUBJECT = { min: 3, max: 5 };
const GRADING_PERIOD = { from: new Date('2026-09-15'), days: 38 };

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(parseDatabaseUrl(process.env.DATABASE_URL ?? '')),
});

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(2026);

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomGrade() {
  const roll = random();
  if (roll < 0.05) return randomInt(1, 4);
  if (roll < 0.2) return randomInt(5, 6);
  if (roll < 0.5) return randomInt(7, 8);
  return randomInt(9, 10);
}

function randomDate(from: Date, days: number) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + randomInt(0, days));
  return date;
}

// Made-up numbers from a range reserved for fiction, not in a Romanian format.
let phoneCounter = 0;

function nextPhone() {
  phoneCounter += 1;
  return `+44 7700 900${String(phoneCounter).padStart(3, '0')}`;
}

function createIdentityFactory(domain: string) {
  const used = new Set<string>();

  return () => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const base = `${firstName}.${lastName}`.toLowerCase();
    let email = `${base}@${domain}`;

    for (let suffix = 2; used.has(email); suffix++) {
      email = `${base}${suffix}@${domain}`;
    }
    used.add(email);

    return { firstName, lastName, email };
  };
}

async function clearDatabase() {
  await prisma.grade.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  if (process.argv.includes('--if-empty') && (await prisma.user.count()) > 0) {
    console.log('The database already has data, the seed was skipped');
    return;
  }

  const hashes = {
    admin: await bcrypt.hash(PASSWORDS.admin, 10),
    teacher: await bcrypt.hash(PASSWORDS.teacher, 10),
    student: await bcrypt.hash(PASSWORDS.student, 10),
  };

  await clearDatabase();

  for (const admin of ADMINS) {
    await prisma.user.create({
      data: {
        email: admin.email,
        passwordHash: hashes.admin,
        role: Role.ADMIN,
        admin: {
          create: {
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.phone,
          },
        },
      },
    });
  }

  await prisma.subject.createMany({
    data: SUBJECTS.map((name) => ({ name })),
  });
  const subjects = await prisma.subject.findMany();

  const teacherIdentity = createIdentityFactory('school.test');
  const teachers: { id: number }[] = [];
  for (let index = 0; index < TEACHER_COUNT; index++) {
    const { firstName, lastName, email } = teacherIdentity();
    teachers.push(
      await prisma.teacher.create({
        data: {
          firstName,
          lastName,
          phone: nextPhone(),
          user: {
            create: { email, passwordHash: hashes.teacher, role: Role.TEACHER },
          },
        },
      }),
    );
  }

  const studentIdentity = createIdentityFactory('student.school.test');
  const createStudent = async (birthYear: number, classId?: number) => {
    const { firstName, lastName, email } = studentIdentity();
    return prisma.student.create({
      data: {
        firstName,
        lastName,
        phone: nextPhone(),
        dateOfBirth: new Date(
          Date.UTC(birthYear, randomInt(0, 11), randomInt(1, 28)),
        ),
        class: classId ? { connect: { id: classId } } : undefined,
        user: {
          create: { email, passwordHash: hashes.student, role: Role.STUDENT },
        },
      },
    });
  };

  const grades = [];
  for (const plan of CLASS_PLANS) {
    const schoolClass = await prisma.class.create({
      data: { name: plan.name, teacherId: teachers[plan.teacherIndex].id },
    });

    const teacherOf = (subjectName: string) =>
      teachers[
        SUBJECT_OVERRIDES.find(
          (item) =>
            item.className === plan.name && item.subject === subjectName,
        )?.teacherIndex ?? SUBJECT_TEACHERS[subjectName]
      ];

    await prisma.teachingAssignment.createMany({
      data: subjects.map((subject) => ({
        classId: schoolClass.id,
        subjectId: subject.id,
        teacherId: teacherOf(subject.name).id,
      })),
    });

    for (let index = 0; index < STUDENTS_PER_CLASS; index++) {
      const student = await createStudent(plan.birthYear, schoolClass.id);

      for (const subject of subjects) {
        const count = randomInt(GRADES_PER_SUBJECT.min, GRADES_PER_SUBJECT.max);
        for (let n = 0; n < count; n++) {
          grades.push({
            studentId: student.id,
            teacherId: teacherOf(subject.name).id,
            subjectId: subject.id,
            value: randomGrade(),
            date: randomDate(GRADING_PERIOD.from, GRADING_PERIOD.days),
          });
        }
      }
    }
  }

  for (let index = 0; index < UNASSIGNED_STUDENTS; index++) {
    await createStudent(2011);
  }

  await prisma.grade.createMany({ data: grades });

  console.log(
    `Seeded ${teachers.length} teachers, ${CLASS_PLANS.length} classes, ` +
      `${CLASS_PLANS.length * STUDENTS_PER_CLASS + UNASSIGNED_STUDENTS} students, ` +
      `${subjects.length} subjects and ${grades.length} grades`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
