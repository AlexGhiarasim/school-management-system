import { CreateSubjectDto } from '../../subjects/dto/create-subject.dto.js';
import type { KindDefinition, ValidatedRow } from '../import.types.js';
import { missing, validateWith } from '../validation.util.js';

export const subjectsKind: KindDefinition = {
  columns: [
    {
      key: 'name',
      header: { ro: 'Materia', en: 'Subject' },
      aliases: ['materia', 'subject', 'name', 'denumire', 'nume'],
      required: true,
      examples: ['Economie', 'Filosofie'],
    },
  ],

  async validate(rows, prisma) {
    const existing = await prisma.subject.findMany({ select: { name: true } });
    const taken = new Set(existing.map(({ name }) => name.toLowerCase()));
    const seen = new Set<string>();

    return rows.map((row): ValidatedRow => {
      const errors = missing(row.values, ['name']);
      const { instance, errors: dtoErrors } = validateWith(
        CreateSubjectDto,
        { name: row.values.name },
        errors,
      );
      errors.push(...dtoErrors);

      const key = instance.name?.toLowerCase();

      if (key && errors.length === 0) {
        if (taken.has(key)) errors.push({ field: 'name', code: 'taken' });
        else if (seen.has(key))
          errors.push({ field: 'name', code: 'duplicate' });
        seen.add(key);
      }

      return {
        ...row,
        errors,
        data: errors.length === 0 ? { name: instance.name } : undefined,
      };
    });
  },

  async save(rows, prisma) {
    await prisma.subject.createMany({
      data: rows.map(({ data }) => data as { name: string }),
    });

    return [];
  },
};
