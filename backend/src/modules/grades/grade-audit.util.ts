import { GradeAuditAction, Prisma } from '../../generated/prisma/client.js';

export interface AuditedGrade {
  id: number;
  value: number;
  date: Date;
  studentId: number;
  subject: { id: number; name: string };
  student: { firstName: string; lastName: string };
}

export function hasChanged(before: AuditedGrade, after: AuditedGrade): boolean {
  return (
    before.value !== after.value ||
    before.subject.id !== after.subject.id ||
    before.date.getTime() !== after.date.getTime()
  );
}

// Builds the log entry of a change. A created grade has no "before" and a
// deleted one has no "after".
export function auditEntry(
  action: GradeAuditAction,
  actorId: number,
  before: AuditedGrade | null,
  after: AuditedGrade | null,
): Prisma.GradeAuditUncheckedCreateInput {
  const grade = after ?? before;

  if (!grade) {
    throw new Error('An audit entry needs the grade before or after');
  }

  const subjectChanged =
    before !== null && after !== null && before.subject.id !== after.subject.id;

  return {
    gradeId: grade.id,
    action,
    actorId,
    studentId: grade.studentId,
    studentName: `${grade.student.firstName} ${grade.student.lastName}`,
    subjectName: grade.subject.name,
    previousSubjectName: subjectChanged ? before.subject.name : null,
    oldValue: before?.value ?? null,
    newValue: after?.value ?? null,
    oldDate: before?.date ?? null,
    newDate: after?.date ?? null,
  };
}
