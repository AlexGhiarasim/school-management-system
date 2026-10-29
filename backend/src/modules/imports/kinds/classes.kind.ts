import { CreateClassDto } from '../../classes/dto/create-class.dto.js';
import type { KindDefinition, ValidatedRow } from '../import.types.js';
import { missing, validateWith } from '../validation.util.js';

interface ClassData {
  name: string;
  teacherId: number | null;
}

export const classesKind: KindDefinition = {
  columns: [
    {
      key: 'name',
      header: { ro: 'Clasa', en: 'Class' },
      aliases: ['clasa', 'class', 'name', 'classname', 'numeclasa'],
      required: true,
      examples: ['9C', '10C'],
    },
    {
      key: 'homeroomTeacher',
      header: { ro: 'Email diriginte', en: 'Homeroom teacher email' },
      aliases: [
        'emaildiriginte',
        'diriginte',
        'dirigintemail',
        'homeroomteacher',
        'homeroomteacheremail',
        'teacheremail',
      ],
      required: false,
      examples: ['laura.marin@school.test', ''],
    },
  ],

  async validate(rows, prisma) {
    const [classes, teachers] = await Promise.all([
      prisma.class.findMany({ select: { name: true } }),
      prisma.teacher.findMany({
        select: {
          id: true,
          user: { select: { email: true } },
          classes: { select: { id: true } },
        },
      }),
    ]);
    const takenNames = new Set(classes.map(({ name }) => name.toLowerCase()));
    const teacherByEmail = new Map(
      teachers.map((teacher) => [teacher.user.email.toLowerCase(), teacher]),
    );
    const seenNames = new Set<string>();
    const seenTeachers = new Set<number>();

    return rows.map((row): ValidatedRow => {
      const errors = missing(row.values, ['name']);
      const { instance, errors: dtoErrors } = validateWith(
        CreateClassDto,
        { name: row.values.name },
        errors,
      );
      errors.push(...dtoErrors);

      const name = instance.name?.toLowerCase();

      if (name && !errors.some(({ field }) => field === 'name')) {
        if (takenNames.has(name)) errors.push({ field: 'name', code: 'taken' });
        else if (seenNames.has(name)) {
          errors.push({ field: 'name', code: 'duplicate' });
        }
        seenNames.add(name);
      }

      let teacherId: number | null = null;
      const email = row.values.homeroomTeacher?.toLowerCase();

      if (email) {
        const teacher = teacherByEmail.get(email);

        if (!teacher) {
          errors.push({ field: 'homeroomTeacher', code: 'teacherNotFound' });
        } else if (teacher.classes.length > 0) {
          errors.push({ field: 'homeroomTeacher', code: 'teacherLeads' });
        } else if (seenTeachers.has(teacher.id)) {
          errors.push({ field: 'homeroomTeacher', code: 'teacherRepeated' });
        } else {
          teacherId = teacher.id;
          seenTeachers.add(teacher.id);
        }
      }

      return {
        ...row,
        errors,
        data:
          errors.length === 0
            ? ({ name: instance.name, teacherId } satisfies ClassData)
            : undefined,
      };
    });
  },

  async save(rows, prisma) {
    await prisma.$transaction(
      rows.map(({ data }) => prisma.class.create({ data: data as ClassData })),
    );

    return [];
  },
};
