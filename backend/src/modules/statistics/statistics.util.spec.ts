import {
  buildStatistics,
  weekStart,
  type StatGrade,
  type StatStudent,
} from './statistics.util.js';

const classA = { id: 1, name: '9A' };
const classB = { id: 2, name: '9B' };
const maths = { id: 1, name: 'Matematică' };
const physics = { id: 2, name: 'Fizică' };

const students: StatStudent[] = [
  { id: 1, firstName: 'Ana', lastName: 'Popa', class: classA },
  { id: 2, firstName: 'Dan', lastName: 'Ionescu', class: classA },
  { id: 3, firstName: 'Ioana', lastName: 'Marin', class: classB },
  { id: 4, firstName: 'Radu', lastName: 'Stan', class: null },
];

function grade(
  studentId: number,
  value: number,
  subject = maths,
  date = '2026-09-16',
): StatGrade {
  return { studentId, value, subject, date: new Date(date) };
}

const grades: StatGrade[] = [
  grade(1, 10),
  grade(1, 9, physics),
  grade(2, 4),
  grade(2, 4, maths, '2026-09-23'),
  grade(2, 8, physics),
  grade(3, 7, maths, '2026-09-24'),
];

describe('weekStart', () => {
  it('returns the Monday of the week', () => {
    expect(weekStart(new Date('2026-09-16'))).toBe('2026-09-14');
    expect(weekStart(new Date('2026-09-14'))).toBe('2026-09-14');
    expect(weekStart(new Date('2026-09-20'))).toBe('2026-09-14');
  });
});

describe('buildStatistics', () => {
  const stats = buildStatistics(students, grades);

  it('counts the students who pass every subject', () => {
    // Ana and Ioana pass, Dan fails Matematică.
    expect(stats.passRate).toBe(66.7);
  });

  it('lists a student with a failed subject as at risk', () => {
    expect(stats.atRisk).toEqual([
      {
        studentId: 2,
        firstName: 'Dan',
        lastName: 'Ionescu',
        className: '9A',
        failingSubjects: [{ subject: 'Matematică', average: 4 }],
      },
    ]);
  });

  it('averages by class, by subject and by week', () => {
    expect(stats.byClass).toEqual([
      { classId: 1, name: '9A', average: 7.75, students: 2 },
      { classId: 2, name: '9B', average: 7, students: 1 },
    ]);
    expect(stats.bySubject).toEqual([
      { subjectId: 2, name: 'Fizică', average: 8.5, grades: 2 },
      { subjectId: 1, name: 'Matematică', average: 6.25, grades: 4 },
    ]);
    expect(stats.trend).toEqual([
      { weekStart: '2026-09-14', average: 7.75, grades: 4 },
      { weekStart: '2026-09-21', average: 5.5, grades: 2 },
    ]);
  });
});
