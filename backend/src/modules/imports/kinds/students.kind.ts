import {
  generatePassword,
  hashPassword,
} from '../../../common/utils/password.util.js';
import { Role } from '../../../generated/prisma/enums.js';
import { CreateStudentDto } from '../../students/dto/create-student.dto.js';
import type { KindDefinition, ValidatedRow } from '../import.types.js';
import { missing, parseDate, validateWith } from '../validation.util.js';

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string;
  classId: number | null;
  password: string;
  generated: boolean;
}

export const studentsKind: KindDefinition = {
  columns: [
    {
      key: 'lastName',
      header: { ro: 'Nume', en: 'Last name' },
      aliases: ['nume', 'lastname', 'familyname', 'surname', 'numedefamilie'],
      required: true,
      examples: ['Popescu', 'Ionescu'],
    },
    {
      key: 'firstName',
      header: { ro: 'Prenume', en: 'First name' },
      aliases: ['prenume', 'firstname', 'givenname'],
      required: true,
      examples: ['Maria', 'Andrei'],
    },
    {
      key: 'email',
      header: { ro: 'Email', en: 'Email' },
      aliases: ['email', 'mail', 'emailaddress'],
      required: true,
      examples: [
        'maria.popescu@student.school.test',
        'andrei.ionescu@student.school.test',
      ],
    },
    {
      key: 'dateOfBirth',
      header: { ro: 'Data nașterii', en: 'Date of birth' },
      aliases: ['datanasterii', 'dateofbirth', 'birthdate', 'dob', 'nascutla'],
      required: true,
      examples: ['17.05.2010', '2010-11-02'],
    },
    {
      key: 'phone',
      header: { ro: 'Telefon', en: 'Phone' },
      aliases: ['telefon', 'phone', 'mobile', 'nrtelefon'],
      required: false,
      examples: ['+40 721 000 111', ''],
    },
    {
      key: 'className',
      header: { ro: 'Clasa', en: 'Class' },
      aliases: ['clasa', 'class', 'classname'],
      required: false,
      examples: ['9A', ''],
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
      prisma.class.findMany({ select: { id: true, name: true } }),
    ]);
    const taken = new Set(existing.map(({ email }) => email.toLowerCase()));
    const classByName = new Map(
      classes.map(({ id, name }) => [name.toLowerCase(), id]),
    );
    const seen = new Set<string>();

    return rows.map(({ line, values }): ValidatedRow => {
      const errors = missing(values, [
        'lastName',
        'firstName',
        'email',
        'dateOfBirth',
      ]);
      const dateOfBirth = parseDate(values.dateOfBirth ?? '');

      // A date that does not exist, like 30.02.2010, is also refused.
      if (values.dateOfBirth && !dateOfBirth) {
        errors.push({ field: 'dateOfBirth', code: 'date' });
      }
      const generated = !values.password;
      const password = values.password || generatePassword();
      const { instance, errors: dtoErrors } = validateWith(
        CreateStudentDto,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          dateOfBirth: dateOfBirth ?? values.dateOfBirth,
          password,
        },
        errors,
      );
      errors.push(...dtoErrors);

      let classId: number | null = null;

      if (values.className) {
        classId = classByName.get(values.className.toLowerCase()) ?? null;

        if (classId === null)
          errors.push({ field: 'className', code: 'classNotFound' });
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
                dateOfBirth: dateOfBirth ?? values.dateOfBirth,
                classId,
                password,
                generated,
              } satisfies StudentData)
            : undefined,
      };
    });
  },

  async save(rows, prisma) {
    const students = rows.map(({ data }) => data as StudentData);
    // Hashing is slow, so it happens before the transaction opens.
    const hashes: string[] = [];

    for (const student of students) {
      hashes.push(await hashPassword(student.password));
    }

    await prisma.$transaction(
      students.map(
        (
          {
            password: _password,
            generated: _generated,
            email,
            classId,
            ...profile
          },
          index,
        ) =>
          prisma.student.create({
            data: {
              ...profile,
              dateOfBirth: new Date(profile.dateOfBirth),
              ...(classId !== null && { class: { connect: { id: classId } } }),
              user: {
                create: {
                  email,
                  passwordHash: hashes[index],
                  role: Role.STUDENT,
                },
              },
            },
          }),
      ),
    );

    return students
      .filter(({ generated }) => generated)
      .map(({ lastName, firstName, email, password }) => ({
        name: `${lastName} ${firstName}`,
        email,
        password,
      }));
  },
};
