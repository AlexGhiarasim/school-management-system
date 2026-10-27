export const SUBJECTS = [
  'Mathematics',
  'Romanian Language',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Computer Science',
  'Physical Education',
];

export const FIRST_NAMES = [
  'Andrei',
  'Maria',
  'Alexandru',
  'Elena',
  'Ioan',
  'Ana',
  'Mihai',
  'Ioana',
  'Stefan',
  'Andreea',
  'Cristian',
  'Diana',
  'Gabriel',
  'Laura',
  'Razvan',
  'Cristina',
  'Bogdan',
  'Alina',
  'Vlad',
  'Teodora',
  'Daniel',
  'Bianca',
  'Radu',
  'Raluca',
  'Florin',
  'Georgiana',
  'Adrian',
  'Monica',
  'Catalin',
  'Simona',
];

export const LAST_NAMES = [
  'Popescu',
  'Ionescu',
  'Popa',
  'Stan',
  'Dumitru',
  'Gheorghe',
  'Constantin',
  'Marin',
  'Stoica',
  'Rusu',
  'Munteanu',
  'Matei',
  'Dinu',
  'Serban',
  'Tudor',
  'Moldovan',
  'Barbu',
  'Nistor',
  'Ilie',
  'Lazar',
  'Preda',
  'Cojocaru',
  'Enache',
  'Neagu',
  'Toma',
];

export const CLASS_PLANS = [
  { name: '9A', birthYear: 2011, teacherIndex: 0 },
  { name: '9B', birthYear: 2011, teacherIndex: 1 },
  { name: '10A', birthYear: 2010, teacherIndex: 2 },
  { name: '10B', birthYear: 2010, teacherIndex: 3 },
  { name: '11A', birthYear: 2009, teacherIndex: 4 },
  { name: '12A', birthYear: 2008, teacherIndex: 5 },
];

// Index of the teacher who teaches each subject in every class.
export const SUBJECT_TEACHERS: Record<string, number> = {
  Mathematics: 0,
  'Romanian Language': 1,
  English: 2,
  Physics: 3,
  Chemistry: 4,
  Biology: 5,
  History: 6,
  Geography: 7,
  'Computer Science': 8,
  'Physical Education': 9,
};

// The one class where a teacher takes a second subject.
export const SUBJECT_OVERRIDES = [
  { className: '9A', subject: 'Physics', teacherIndex: 0 },
];

export const TEACHER_COUNT = 10;
export const STUDENTS_PER_CLASS = 20;
export const UNASSIGNED_STUDENTS = 3;
