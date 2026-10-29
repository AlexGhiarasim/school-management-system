import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { Redis } from 'ioredis';
import { parseDatabaseUrl } from '../src/database/database-url.js';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import {
  ADMINS,
  CLASS_SIZE,
  CLASS_TEACHER_PRIORITY,
  FIRST_NAMES,
  FIRST_STUDENT,
  FIRST_TEACHER,
  GRADE_COUNT_WEIGHTS,
  GRADE_LEVELS,
  GRADE_WEIGHTS,
  GRADING_PERIOD,
  LAST_NAMES,
  SECTIONS,
  SKILL_WEIGHTS,
  SUBJECT_GROUPS,
  SUBJECTS_BY_GRADE,
  UNASSIGNED_STUDENTS,
} from './seed-data.js';

config({ path: '../.env', quiet: true });

const PASSWORDS = {
  admin: 'Admin123!',
  teacher: 'Teacher123!',
  student: 'Student123!',
};

const CHUNK = 2000;

const FIRST_STUDENT_EMAIL =
  `${FIRST_STUDENT.firstName}.${FIRST_STUDENT.lastName}@student.school.test`.toLowerCase();

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

// The same seed gives the same school every time.
const random = createRandom(2026);

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function weighted<T>(options: readonly (readonly [T, number])[]): T {
  const total = options.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;

  for (const [value, weight] of options) {
    roll -= weight;
    if (roll < 0) return value;
  }

  return options[options.length - 1][0];
}

// A few distinct items, in their original order.
function sample<T>(items: T[], count: number): T[] {
  const chosen = new Set<number>();

  while (chosen.size < Math.min(count, items.length)) {
    chosen.add(randomInt(0, items.length - 1));
  }

  return [...chosen].sort((a, b) => a - b).map((index) => items[index]);
}

function weekdays(from: string, to: string): Date[] {
  const days: Date[] = [];
  const end = new Date(`${to}T00:00:00Z`);

  for (
    const day = new Date(`${from}T00:00:00Z`);
    day <= end;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) {
      days.push(new Date(day));
    }
  }

  return days;
}

// Made-up numbers from a range reserved for fiction, not in a Romanian format.
let phoneCounter = 0;

function nextPhone() {
  phoneCounter += 1;
  return `+44 7700 900${String(phoneCounter).padStart(3, '0')}`;
}

function createIdentityFactory(domain: string) {
  const used = new Set<string>();

  return (fixed?: { firstName: string; lastName: string }) => {
    let firstName = fixed?.firstName ?? pick(FIRST_NAMES);
    let lastName = fixed?.lastName ?? pick(LAST_NAMES);
    let base = `${firstName}.${lastName}`.toLowerCase();

    // A different name is tried a few times before a number is added.
    for (
      let attempt = 0;
      !fixed && attempt < 6 && used.has(`${base}@${domain}`);
      attempt++
    ) {
      firstName = pick(FIRST_NAMES);
      lastName = pick(LAST_NAMES);
      base = `${firstName}.${lastName}`.toLowerCase();
    }

    let email = `${base}@${domain}`;

    for (let suffix = 2; used.has(email); suffix++) {
      email = `${base}${suffix}@${domain}`;
    }
    used.add(email);

    return { firstName, lastName, email };
  };
}

async function inChunks<T>(items: T[], save: (chunk: T[]) => Promise<unknown>) {
  for (let index = 0; index < items.length; index += CHUNK) {
    await save(items.slice(index, index + CHUNK));
  }
}

// The seed changes the data behind the cache, so the cached results are dropped.
async function clearCache() {
  const url = process.env.REDIS_URL;

  if (!url) return;

  const redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  });

  try {
    await redis.connect();
    await redis.incr('cache:version');
  } catch {
    // Without Redis there is nothing to clear.
  } finally {
    redis.disconnect();
  }
}

async function clearDatabase() {
  await prisma.gradeAudit.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
}

interface Person {
  firstName: string;
  lastName: string;
  email: string;
}

interface TeacherPlan extends Person {
  group: number;
}

interface StudentPlan extends Person {
  classIndex: number | null;
  birthYear: number;
  skill: keyof typeof GRADE_WEIGHTS;
}

interface GradeRow {
  studentId: number;
  teacherId: number;
  subjectId: number;
  value: number;
  date: Date;
}

// Failing a subject means a rounded average below 5, as in the application.
const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const FAILING_PATTERNS: Record<number, number[][]> = {
  1: [[4]],
  2: [
    [4, 4],
    [3, 5],
    [5, 3],
    [4, 3],
  ],
  3: [
    [4, 5, 4],
    [3, 5, 5],
    [4, 4, 5],
    [5, 4, 3],
  ],
  4: [[4, 4, 5, 4]],
};

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

  const classPlans = GRADE_LEVELS.flatMap((grade) =>
    SECTIONS.map((section) => ({ name: `${grade}${section}`, grade })),
  );
  const subjectNames = [...new Set(Object.values(SUBJECTS_BY_GRADE).flat())];

  await prisma.subject.createMany({
    data: subjectNames.map((name) => ({ name })),
  });
  const subjectId = new Map(
    (await prisma.subject.findMany()).map(({ id, name }) => [name, id]),
  );

  // --- Teachers: a few for every group of subjects.
  const teacherIdentity = createIdentityFactory('school.test');
  const teacherPlans: TeacherPlan[] = SUBJECT_GROUPS.flatMap(
    ({ teachers }, group) =>
      Array.from({ length: teachers }, (_, index) => ({
        group,
        ...teacherIdentity(
          group === 0 && index === 0 ? FIRST_TEACHER : undefined,
        ),
      })),
  );

  await prisma.user.createMany({
    data: teacherPlans.map(({ email }) => ({
      email,
      passwordHash: hashes.teacher,
      role: Role.TEACHER,
    })),
  });
  const userIds = new Map(
    (await prisma.user.findMany({ select: { id: true, email: true } })).map(
      ({ id, email }) => [email, id],
    ),
  );
  await prisma.teacher.createMany({
    data: teacherPlans.map(({ firstName, lastName, email }) => ({
      firstName,
      lastName,
      phone: nextPhone(),
      userId: userIds.get(email) ?? 0,
    })),
  });
  const teacherByEmail = new Map(
    (
      await prisma.teacher.findMany({
        select: { id: true, user: { select: { email: true } } },
      })
    ).map(({ id, user }) => [user.email, id]),
  );

  // The teachers of a group each take a block of neighbouring classes.
  const groupOfSubject = new Map(
    SUBJECT_GROUPS.flatMap(({ subjects }, group) =>
      subjects.map((name) => [name, group] as const),
    ),
  );
  const teachersOfGroup = SUBJECT_GROUPS.map((_, group) =>
    teacherPlans.filter((plan) => plan.group === group),
  );
  const teacherFor = (classIndex: number, subject: string) => {
    const pool = teachersOfGroup[groupOfSubject.get(subject) ?? 0];
    const teacher =
      pool[Math.floor((classIndex * pool.length) / classPlans.length)];

    return teacherByEmail.get(teacher.email) ?? 0;
  };
  const subjectsOf = (classIndex: number) =>
    SUBJECTS_BY_GRADE[classPlans[classIndex].grade];

  // --- Every class gets a class teacher who teaches in it, never twice.
  const priority = CLASS_TEACHER_PRIORITY.map(
    (name) => groupOfSubject.get(name) ?? 0,
  );
  const classTeachers = new Set<number>();
  const classTeacherOf = classPlans.map((_, classIndex) => {
    for (let step = 0; step < priority.length; step++) {
      const subject = subjectsOf(classIndex).find(
        (name) =>
          groupOfSubject.get(name) ===
          priority[(classIndex + step) % priority.length],
      );
      const teacherId = subject ? teacherFor(classIndex, subject) : 0;

      if (teacherId && !classTeachers.has(teacherId)) {
        classTeachers.add(teacherId);
        return teacherId;
      }
    }

    throw new Error(
      `No class teacher is left for ${classPlans[classIndex].name}`,
    );
  });

  await prisma.class.createMany({
    data: classPlans.map(({ name }, index) => ({
      name,
      teacherId: classTeacherOf[index],
    })),
  });
  const classId = new Map(
    (await prisma.class.findMany()).map(({ id, name }) => [name, id]),
  );

  await prisma.teachingAssignment.createMany({
    data: classPlans.flatMap(({ name }, classIndex) =>
      subjectsOf(classIndex).map((subject) => ({
        classId: classId.get(name) ?? 0,
        subjectId: subjectId.get(subject) ?? 0,
        teacherId: teacherFor(classIndex, subject),
      })),
    ),
  });

  // --- Students: 26 to 32 in each class, and a few without a class.
  const studentIdentity = createIdentityFactory('student.school.test');
  const studentPlans: StudentPlan[] = [];
  const newStudent = (
    classIndex: number | null,
    grade: number,
    fixed?: typeof FIRST_STUDENT,
  ) => {
    // Most students are the age of their year, a few are a year older.
    const birthYear = 2011 - (grade - 9) - (random() < 0.12 ? 1 : 0);

    studentPlans.push({
      ...studentIdentity(fixed),
      classIndex,
      birthYear,
      skill: weighted(SKILL_WEIGHTS),
    });
  };

  classPlans.forEach(({ grade }, classIndex) => {
    const size = randomInt(CLASS_SIZE.min, CLASS_SIZE.max);

    for (let index = 0; index < size; index++) {
      newStudent(
        classIndex,
        grade,
        classIndex === 0 && index === 0 ? FIRST_STUDENT : undefined,
      );
    }
  });

  for (let index = 0; index < UNASSIGNED_STUDENTS; index++) {
    newStudent(null, 9);
  }

  await inChunks(studentPlans, (chunk) =>
    prisma.user.createMany({
      data: chunk.map(({ email }) => ({
        email,
        passwordHash: hashes.student,
        role: Role.STUDENT,
      })),
    }),
  );
  const studentUserIds = new Map(
    (
      await prisma.user.findMany({
        where: { role: Role.STUDENT },
        select: { id: true, email: true },
      })
    ).map(({ id, email }) => [email, id]),
  );
  await inChunks(studentPlans, (chunk) =>
    prisma.student.createMany({
      data: chunk.map(
        ({ firstName, lastName, email, classIndex, birthYear }) => ({
          firstName,
          lastName,
          phone: nextPhone(),
          dateOfBirth: new Date(
            Date.UTC(birthYear, randomInt(0, 11), randomInt(1, 28)),
          ),
          classId:
            classIndex === null
              ? null
              : classId.get(classPlans[classIndex].name),
          userId: studentUserIds.get(email) ?? 0,
        }),
      ),
    }),
  );
  const studentId = new Map(
    (
      await prisma.student.findMany({
        select: { id: true, user: { select: { email: true } } },
      })
    ).map(({ id, user }) => [user.email, id]),
  );

  // --- Grades: weekdays from 1 September to the last day, 1 to 3 in a subject.
  const days = weekdays(GRADING_PERIOD.from, GRADING_PERIOD.to);
  const grades: GradeRow[] = [];
  const twoClass = randomInt(0, classPlans.length - 1);
  let twoGiven = false;

  classPlans.forEach((_, classIndex) => {
    const students = studentPlans.filter(
      (plan) => plan.classIndex === classIndex,
    );
    const subjects = subjectsOf(classIndex);

    // Two or three students fail one subject, a few of them two.
    const failing = new Map<string, string[]>();
    for (const student of sample(
      students.filter(({ email }) => email !== FIRST_STUDENT_EMAIL),
      randomInt(2, 3),
    )) {
      failing.set(student.email, sample(subjects, random() < 0.2 ? 2 : 1));
    }

    for (const subject of subjects) {
      const teacherId = teacherFor(classIndex, subject);
      // The teacher grades the class on a few days, most students on each.
      const gradingDays = sample(days, randomInt(4, 6));

      for (const student of students) {
        const count = weighted(GRADE_COUNT_WEIGHTS);
        const dates = sample(gradingDays, count);
        let values = dates.map(() => weighted(GRADE_WEIGHTS[student.skill]));

        if (failing.get(student.email)?.includes(subject)) {
          if (classIndex === twoClass && !twoGiven) {
            // The only 2 of the school.
            values = [2, 6];
            twoGiven = true;
          } else {
            values = pick(FAILING_PATTERNS[dates.length]);
          }
        } else if (dates.length >= 2) {
          // A rare low grade, kept where the average stays 5 or more.
          const low = random() < 0.008 ? 4 : random() < 0.0025 ? 3 : null;
          const index = randomInt(0, values.length - 1);
          const changed = values.map((value, at) =>
            at === index && low ? low : value,
          );

          if (low && Math.round(average(changed)) >= 5) values = changed;
        }

        // One grade for each date, also when a pattern changed their number.
        const used =
          values.length === dates.length
            ? dates
            : sample(gradingDays, values.length);
        values.forEach((value, at) =>
          grades.push({
            studentId: studentId.get(student.email) ?? 0,
            teacherId,
            subjectId: subjectId.get(subject) ?? 0,
            value,
            date: used[at],
          }),
        );
      }
    }
  });

  await inChunks(grades, (chunk) => prisma.grade.createMany({ data: chunk }));
  await clearCache();

  const perStudentSubject = new Map<string, number[]>();
  for (const { studentId: student, subjectId: subject, value } of grades) {
    const key = `${student}-${subject}`;
    perStudentSubject.set(key, [...(perStudentSubject.get(key) ?? []), value]);
  }
  const failingStudents = new Set(
    [...perStudentSubject]
      .filter(([, values]) => Math.round(average(values)) < 5)
      .map(([key]) => key.split('-')[0]),
  );

  console.log(
    `Seeded ${teacherPlans.length} teachers, ${classPlans.length} classes, ` +
      `${studentPlans.length} students, ${subjectNames.length} subjects and ` +
      `${grades.length} grades, ${failingStudents.size} students failing a subject`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
