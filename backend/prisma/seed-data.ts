export const SUBJECTS = [
  'Matematică',
  'Limba română',
  'Limba engleză',
  'Fizică',
  'Chimie',
  'Biologie',
  'Istorie',
  'Geografie',
  'Informatică',
  'Educație fizică',
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
  Matematică: 0,
  'Limba română': 1,
  'Limba engleză': 2,
  Fizică: 3,
  Chimie: 4,
  Biologie: 5,
  Istorie: 6,
  Geografie: 7,
  Informatică: 8,
  'Educație fizică': 9,
};

// The one class where a teacher takes a second subject.
export const SUBJECT_OVERRIDES = [
  { className: '9A', subject: 'Fizică', teacherIndex: 0 },
];

export const TEACHER_COUNT = 10;
export const STUDENTS_PER_CLASS = 20;
export const UNASSIGNED_STUDENTS = 3;
