import { AuthCard } from '../features/auth/components/AuthCard.tsx';

const ROLES = [
  {
    name: 'Administrators',
    description:
      'Manage students, teachers and classes, and oversee every grade.',
  },
  {
    name: 'Teachers',
    description: 'See your classes and record grades for your students.',
  },
  {
    name: 'Students',
    description: 'Follow your grades and your average at a glance.',
  },
];

export default function HomePage() {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-center bg-indigo-700 px-8 py-12 text-white sm:px-14 lg:px-20">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">
          School Management System
        </p>
        <h1 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          One place for classes, teachers, students and grades.
        </h1>
        <ul className="mt-10 hidden max-w-md space-y-6 lg:block">
          {ROLES.map((role) => (
            <li key={role.name} className="border-l-2 border-indigo-400 pl-4">
              <p className="font-medium">{role.name}</p>
              <p className="mt-1 text-sm text-indigo-100">{role.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <AuthCard />
      </main>
    </div>
  );
}
