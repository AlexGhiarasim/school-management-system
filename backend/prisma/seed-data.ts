// Both share the admin password. Phone numbers are made up, outside the range
// used for teachers and students.
export const ADMINS = [
  {
    email: 'admin@school.test',
    firstName: 'Cristina',
    lastName: 'Albu',
    phone: '+44 7700 900990',
  },
  {
    email: 'admin2@school.test',
    firstName: 'Mihai',
    lastName: 'Voicu',
    phone: '+44 7700 900991',
  },
];

export const GRADE_LEVELS = [9, 10, 11, 12];
export const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

const CORE_SUBJECTS = [
  'Limba română',
  'Limba engleză',
  'Limba franceză',
  'Matematică',
  'Fizică',
  'Chimie',
  'Biologie',
  'Istorie',
  'Geografie',
  'Informatică',
  'Educație fizică',
  'Religie',
];

// What a high school teaches in each year: the same core, and one subject
// that changes from year to year.
export const SUBJECTS_BY_GRADE: Record<number, string[]> = {
  9: [...CORE_SUBJECTS, 'Educație socială'],
  10: [...CORE_SUBJECTS, 'Logică și argumentare'],
  11: [...CORE_SUBJECTS, 'Filosofie'],
  12: [...CORE_SUBJECTS, 'Economie'],
};

// A teacher teaches the subjects of one group, in a block of classes. The
// four subjects of the last group are taught in different years, so each class
// has one of them.
export const SUBJECT_GROUPS = [
  { subjects: ['Matematică'], teachers: 6 },
  { subjects: ['Limba română'], teachers: 6 },
  { subjects: ['Limba engleză'], teachers: 4 },
  { subjects: ['Limba franceză'], teachers: 3 },
  { subjects: ['Fizică'], teachers: 3 },
  { subjects: ['Chimie'], teachers: 3 },
  { subjects: ['Biologie'], teachers: 3 },
  { subjects: ['Istorie'], teachers: 3 },
  { subjects: ['Geografie'], teachers: 3 },
  { subjects: ['Informatică'], teachers: 4 },
  { subjects: ['Educație fizică'], teachers: 3 },
  { subjects: ['Religie'], teachers: 2 },
  {
    subjects: [
      'Educație socială',
      'Logică și argumentare',
      'Filosofie',
      'Economie',
    ],
    teachers: 3,
  },
];

// The class teacher is usually a teacher of one of these, the first listed
// first.
export const CLASS_TEACHER_PRIORITY = [
  'Matematică',
  'Limba română',
  'Limba engleză',
  'Limba franceză',
  'Biologie',
  'Istorie',
  'Geografie',
  'Chimie',
  'Fizică',
  'Informatică',
];

// The accounts that the README names.
export const FIRST_TEACHER = { firstName: 'Laura', lastName: 'Marin' };
export const FIRST_STUDENT = { firstName: 'Mihai', lastName: 'Constantin' };

export const CLASS_SIZE = { min: 26, max: 32 };
export const UNASSIGNED_STUDENTS = 4;

// Weekdays only. The last day is the day the data was prepared.
export const GRADING_PERIOD = { from: '2026-09-01', to: '2026-10-29' };

// How many grades a student has in a subject until now.
export const GRADE_COUNT_WEIGHTS: [number, number][] = [
  [1, 30],
  [2, 40],
  [3, 25],
  [4, 5],
];

// The grades of a student who is doing well, fine or badly. The low grades
// that a few students get are added separately.
export const GRADE_WEIGHTS = {
  strong: [
    [10, 45],
    [9, 30],
    [8, 15],
    [7, 7],
    [6, 3],
  ],
  normal: [
    [10, 26],
    [9, 27],
    [8, 22],
    [7, 13],
    [6, 8],
    [5, 4],
  ],
  weak: [
    [10, 8],
    [9, 14],
    [8, 22],
    [7, 24],
    [6, 18],
    [5, 14],
  ],
} satisfies Record<string, [number, number][]>;

export const SKILL_WEIGHTS: [keyof typeof GRADE_WEIGHTS, number][] = [
  ['strong', 25],
  ['normal', 50],
  ['weak', 25],
];

export const FIRST_NAMES = [
  'Maria',
  'Elena',
  'Ana',
  'Ioana',
  'Andreea',
  'Diana',
  'Laura',
  'Cristina',
  'Alina',
  'Teodora',
  'Bianca',
  'Raluca',
  'Georgiana',
  'Monica',
  'Simona',
  'Daniela',
  'Mihaela',
  'Alexandra',
  'Gabriela',
  'Roxana',
  'Larisa',
  'Denisa',
  'Carmen',
  'Irina',
  'Oana',
  'Paula',
  'Sorina',
  'Adriana',
  'Lavinia',
  'Nicoleta',
  'Madalina',
  'Ruxandra',
  'Claudia',
  'Camelia',
  'Stefania',
  'Ilinca',
  'Antonia',
  'Patricia',
  'Sara',
  'Delia',
  'Andrei',
  'Alexandru',
  'Ioan',
  'Mihai',
  'Stefan',
  'Cristian',
  'Gabriel',
  'Razvan',
  'Bogdan',
  'Vlad',
  'Daniel',
  'Radu',
  'Florin',
  'Adrian',
  'Catalin',
  'Marius',
  'Sebastian',
  'Tudor',
  'Matei',
  'Darius',
  'Lucian',
  'Octavian',
  'Nicolae',
  'Dragos',
  'Sorin',
  'Costin',
  'Eduard',
  'Robert',
  'David',
  'Paul',
  'Victor',
  'Horia',
  'Rares',
  'Cosmin',
  'Ionut',
  'Lucas',
  'Emil',
  'Teodor',
  'Dan',
  'George',
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
  'Dobre',
  'Radu',
  'Vasile',
  'Florea',
  'Diaconu',
  'Mocanu',
  'Ciobanu',
  'Stanciu',
  'Oprea',
  'Dragomir',
  'Georgescu',
  'Manole',
  'Avram',
  'Anghel',
  'Craciun',
  'Cristea',
  'Lungu',
  'Marinescu',
  'Nedelcu',
  'Pavel',
  'Petre',
  'Sandu',
  'Savu',
  'Tanase',
  'Ungureanu',
  'Vlad',
  'Zamfir',
  'Bucur',
  'Coman',
  'Duta',
  'Filip',
  'Grigore',
  'Iacob',
  'Lupu',
  'Mihai',
  'Nita',
  'Olteanu',
  'Paun',
  'Rotaru',
  'Sima',
  'Soare',
];
