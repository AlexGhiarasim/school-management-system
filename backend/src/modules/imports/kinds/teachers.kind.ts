import {
  generatePassword,
  hashPassword,
} from '../../../common/utils/password.util.js';
import { Role } from '../../../generated/prisma/enums.js';
import { CreateTeacherDto } from '../../teachers/dto/create-teacher.dto.js';
import type { KindDefinition, ValidatedRow } from '../import.types.js';
import { missing, validateWith } from '../validation.util.js';

interface TeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  homeroomClassId: number | null;
  password: string;
  generated: boolean;
}

export const teachersKind: KindDefinition = {
  columns: [
    {
      key: 'lastName',
      header: { ro: 'Nume', en: 'Last name' },
      aliases: ['nume', 'lastname', 'familyname', 'surname', 'numedefamilie'],
      required: true,
      examples: ['Dumitrescu', 'Stoica'],
    },
    {
      key: 'firstName',
      header: { ro: 'Prenume', en: 'First name' },
      aliases: ['prenume', 'firstname', 'givenname'],
      required: true,
      examples: ['Elena', 'Radu'],
    },
    {
      key: 'email',
      header: { ro: 'Email', en: 'Email' },
      aliases: ['email', 'mail', 'emailaddress'],
      required: true,
      examples: ['elena.dumitrescu@school.test', 'radu.stoica@school.test'],
    },
    {
      key: 'phone',
      header: { ro: 'Telefon', en: 'Phone' },
      aliases: ['telefon', 'phone', 'mobile', 'nrtelefon'],
      required: false,
      examples: ['+40 722 000 222', ''],
    },
    {
      key: 'homeroomClass',
      header: { ro: 'Diriginte la clasa', en: 'Homeroom class' },
      aliases: [
        'dirigintelaclasa',
        'clasadiriginte',
        'homeroomclass',
        'homeroom',
        'diriginte',
      ],
      required: false,
      examples: ['9C', ''],
    },
    {
      key: 'password',
      header: { ro: 'Parola', en: 'Password' },
      aliases: ['parola', 'password', 'parolainitiala'],
      required: false,
      examples: ['', ''],
    },
  ],

  async validate(rows, prisma) {
    const emails = rows
      .map(({ values }) => values.email?.toLowerCase())
      .filter(Boolean);
    const [existing, classes] = await Promise.all([
      prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      }),
      prisma.class.findMany({
        select: { id: true, name: true, teacherId: true },
      }),
    ]);
    const taken = new Set(existing.map(({ email }) => email.toLowerCase()));
    const classByName = new Map(
      classes.map((item) => [item.name.toLowerCase(), item]),
    );
    const seen = new Set<string>();
    const seenClasses = new Set<number>();

    return rows.map(({ line, values }): ValidatedRow => {
      const errors = missing(values, ['lastName', 'firstName', 'email']);
      const generated = !values.password;
      const password = values.password || generatePassword();
      const { instance, errors: dtoErrors } = validateWith(
        CreateTeacherDto,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          password,
        },
        errors,
      );
      errors.push(...dtoErrors);

      let homeroomClassId: number | null = null;

      if (values.homeroomClass) {
        const schoolClass = classByName.get(values.homeroomClass.toLowerCase());

        if (!schoolClass) {
          errors.push({ field: 'homeroomClass', code: 'classNotFound' });
        } else if (schoolClass.teacherId !== null) {
          errors.push({ field: 'homeroomClass', code: 'classHasTeacher' });
        } else if (seenClasses.has(schoolClass.id)) {
          errors.push({ field: 'homeroomClass', code: 'classRepeated' });
        } else {
          homeroomClassId = schoolClass.id;
          seenClasses.add(schoolClass.id);
        }
      }

      if (instance.email && !errors.some(({ field }) => field === 'email')) {
        if (taken.has(instance.email))
          errors.push({ field: 'email', code: 'taken' });
        else if (seen.has(instance.email)) {
          errors.push({ field: 'email', code: 'duplicate' });
        }
        seen.add(instance.email);
      }

      return {
        line,
        values: { ...values, password: generated ? 'generated' : 'provided' },
        errors,
        data:
          errors.length === 0
            ? ({
                firstName: instance.firstName,
                lastName: instance.lastName,
                email: instance.email,
                phone: instance.phone ?? null,
                homeroomClassId,
                password,
                generated,
              } satisfies TeacherData)
            : undefined,
      };
    });
  },

  async save(rows, prisma) {
    const teachers = rows.map(({ data }) => data as TeacherData);
    const hashes: string[] = [];

    for (const teacher of teachers) {
      hashes.push(await hashPassword(teacher.password));
    }

    await prisma.$transaction(
      async (tx) => {
        for (const [index, teacher] of teachers.entries()) {
          const { firstName, lastName, email, phone, homeroomClassId } =
            teacher;
          const created = await tx.teacher.create({
            data: {
              firstName,
              lastName,
              phone,
              user: {
                create: {
                  email,
                  passwordHash: hashes[index],
                  role: Role.TEACHER,
                },
              },
            },
          });

          if (homeroomClassId !== null) {
            await tx.class.update({
              where: { id: homeroomClassId },
              data: { teacherId: created.id },
            });
          }
        }
      },
      { timeout: 30_000 },
    );

    return teachers
      .filter(({ generated }) => generated)
      .map(({ lastName, firstName, email, password }) => ({
        name: `${lastName} ${firstName}`,
        email,
        password,
      }));
  },
};
