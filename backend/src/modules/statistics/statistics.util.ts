import { toDateOnly } from '../../common/utils/date.util.js';
import { average, summarize } from '../grades/grades.util.js';

export const GRADE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const PASSING_AVERAGE = 5;
const TOP_STUDENTS = 5;

export interface StatGrade {
  value: number;
  date: Date;
  studentId: number;
  subject: { id: number; name: string };
}

export interface StatStudent {
  id: number;
  firstName: string;
  lastName: string;
  class: { id: number; name: string } | null;
}

export interface FailingSubject {
  subject: string;
  average: number;
}

interface StudentResult {
  student: StatStudent;
  average: number;
  failingSubjects: FailingSubject[];
}

// Monday of the week, in UTC, so a week reads the same in every time zone.
export function weekStart(date: Date): string {
  const monday = new Date(date);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return toDateOnly(monday);
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();

  for (const item of items) {
    const group = groups.get(key(item)) ?? [];
    group.push(item);
    groups.set(key(item), group);
  }

  return groups;
}

// Uses the same rules as the grades of a student: a subject is failed when its
// rounded average is below 5.
function studentResults(
  students: StatStudent[],
  grades: StatGrade[],
): StudentResult[] {
  const gradesByStudent = groupBy(grades, (grade) => grade.studentId);

  return students.flatMap((student) => {
    const own = gradesByStudent.get(student.id);
    if (!own) return [];

    const summary = summarize(own);

    return {
      student,
      average: summary.average ?? 0,
      failingSubjects: summary.bySubject
        .filter((subject) => subject.average < PASSING_AVERAGE)
        .map(({ subject, average }) => ({ subject, average })),
    };
  });
}

function toStudentSummary({ student, average }: StudentResult) {
  return {
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.class?.name ?? null,
    average,
  };
}

export function buildStatistics(students: StatStudent[], grades: StatGrade[]) {
  const results = studentResults(students, grades);
  const passing = results.filter(
    (result) => result.failingSubjects.length === 0,
  );

  const byClass = [...groupBy(results, (result) => result.student.class?.id)]
    .flatMap(([classId, members]) => {
      const schoolClass = members[0].student.class;
      if (classId === undefined || !schoolClass) return [];

      return {
        classId,
        name: schoolClass.name,
        average: average(members.map((member) => member.average)),
        students: members.length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const bySubject = [...groupBy(grades, (grade) => grade.subject.id)]
    .map(([subjectId, subjectGrades]) => ({
      subjectId,
      name: subjectGrades[0].subject.name,
      average: average(subjectGrades.map((grade) => grade.value)),
      grades: subjectGrades.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const trend = [...groupBy(grades, (grade) => weekStart(grade.date))]
    .map(([week, weekGrades]) => ({
      weekStart: week,
      average: average(weekGrades.map((grade) => grade.value)),
      grades: weekGrades.length,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const ranked = [...results].sort((a, b) => b.average - a.average);

  return {
    totals: {
      students: students.length,
      gradedStudents: results.length,
      grades: grades.length,
    },
    passRate:
      results.length === 0
        ? null
        : Math.round((passing.length / results.length) * 1000) / 10,
    distribution: GRADE_VALUES.map((value) => ({
      value,
      count: grades.filter((grade) => grade.value === value).length,
    })),
    byClass,
    bySubject,
    trend,
    topStudents: ranked.slice(0, TOP_STUDENTS).map(toStudentSummary),
    atRisk: results
      .filter((result) => result.failingSubjects.length > 0)
      .sort(
        (a, b) =>
          b.failingSubjects.length - a.failingSubjects.length ||
          a.average - b.average,
      )
      .map(({ student, failingSubjects }) => ({
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.class?.name ?? null,
        failingSubjects,
      })),
  };
}
