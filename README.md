# School Management System

Web application for managing students, teachers, classes and grades, with JWT
authentication and role-based access control.

## Tech stack

- Backend: NestJS 12 (TypeScript), Prisma 7, MySQL 8.4
- Frontend: React 19, Vite, Tailwind CSS (project scaffold, not connected to the API yet)
- Auth: JWT, bcrypt, role-based access control (Admin, Teacher, Student)
- API docs: Swagger
- Tooling: Docker Compose, GitHub Actions, Vitest, oxlint, Prettier

## Getting started

Prerequisites: Node.js 24, npm and Docker.

1. Create the environment file:

   ```bash
   cp .env.example .env
   ```

2. Start MySQL:

   ```bash
   docker compose up -d
   ```

3. Install, migrate, seed and start the backend:

   ```bash
   cd backend
   npm install
   npm run prisma:deploy
   npm run prisma:seed
   npm run start:dev
   ```

The API runs on `http://localhost:3000/api` and the Swagger documentation is
available at `http://localhost:3000/api/docs`. Use the **Authorize** button there
with the token returned by `POST /api/auth/login`.

The frontend scaffold can be started with `npm install` and `npm run dev` inside
`frontend/`.

## Test accounts

The seed script creates one admin, 10 teachers, 6 classes, 123 students, 10
subjects and about 4800 grades. All teachers share one password and all students
share another.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.test` | `Admin123!` |
| Teacher | `laura.marin@school.test` (teaches 9A and 12A) | `Teacher123!` |
| Student | `mihai.constantin@student.school.test` | `Student123!` |

Other accounts follow the same pattern: teachers use `@school.test` and students
use `@student.school.test`. Run `npm run prisma:seed` again at any time to reset
the data.

## API overview

All endpoints are under `/api`. Lists accept `page` and `limit` and return
`{ data, meta }`.

| Endpoint | Admin | Teacher | Student |
|---|---|---|---|
| `POST /auth/login` | public | public | public |
| `GET /auth/me` | yes | yes | yes |
| `GET /health` | public | public | public |
| `/subjects` (read) | yes | yes | yes |
| `/subjects` (create, update, delete) | yes | no | no |
| `/teachers` (CRUD) | yes | no | no |
| `GET /teachers/me/classes` | no | yes | no |
| `/classes` (CRUD) | yes | no | no |
| `PATCH /classes/:id/teacher` | yes | no | no |
| `GET /classes/:id/students` | yes | own classes | no |
| `/students` (CRUD) | yes | no | no |
| `PATCH /students/:id/class` | yes | no | no |
| `GET /students/me` | no | no | yes |
| `GET /grades` | yes | own students | no |
| `POST /grades` | yes | own students | no |
| `PATCH /grades/:id` | yes | grades they gave | no |
| `DELETE /grades/:id` | yes | no | no |
| `GET /grades/me` (grades and averages) | no | no | yes |

Authorization is enforced on the backend by a global JWT guard and a roles guard.
Ownership rules live in the services:

- A teacher can grade and view only students from the classes they teach.
- A teacher can edit only the grades they gave.
- The identity of a student or teacher always comes from the token, never from the URL.

## Project structure

```
backend/
  prisma/            Schema, migrations and seed
  src/
    common/          Decorators, guards, filters, DTOs and helpers
    config/          Environment validation
    database/        Prisma service and module
    modules/         auth, health, subjects, teachers, classes, students, grades
  test/              End-to-end tests
frontend/            React application
docker/              Container initialization scripts
docs/                Project plan
```

## Testing

```bash
cd backend
npm test
npm run test:e2e
```

Unit tests cover the authorization and grading rules. End-to-end tests start the
real application against MySQL and check authentication, role restrictions and
the grading flow. They create their own data and remove it afterwards, so the
database must be running and migrated. GitHub Actions runs lint, build, unit
tests, migrations and end-to-end tests on every pull request that touches the
backend.

## Design decisions

- **Prisma and MySQL.** The schema is the single source of truth and the client
  is fully typed. Migrations are versioned, and a database constraint keeps grade
  values between 1 and 10.
- **One `User` table for login.** Teachers and students are profiles linked to a
  user. Their email lives on the user and is returned flattened in responses.
  Deleting a profile deletes its account in the same operation.
- **Subjects as a table.** Grades reference a subject, which keeps names
  consistent and makes averages per subject reliable.
- **Short-lived access tokens, no refresh tokens.** This keeps the scope small. A
  deactivated account loses access immediately, because the token is checked
  against the database on every request.
- **Rate limiting.** Login is limited to 5 attempts per minute, the rest of the
  API to 100 requests per minute.

## Status

The backend is complete and covered by tests. The frontend has its structure and
tooling in place, and the screens for each role are the next step. The plan is
tracked in [docs/PLAN.md](docs/PLAN.md).
