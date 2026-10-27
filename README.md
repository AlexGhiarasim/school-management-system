# School Management System

Web application for managing students, teachers, classes and grades, with JWT
authentication and role-based access control.

## Tech stack

- Backend: NestJS 12 (TypeScript), Prisma 7, MySQL 8.4
- Frontend: React 19, Vite, Tailwind CSS, i18next (Romanian and English)
- Auth: JWT, bcrypt, role-based access control (Admin, Teacher, Student)
- API docs: Swagger
- Tooling: Docker Compose, GitHub Actions, Vitest, oxlint, Prettier

## Getting started

### Run everything with Docker

Prerequisite: Docker.

```bash
cp .env.example .env
docker compose up --build
```

The first start builds the images, creates the database tables and loads the
sample data. When the containers are healthy, open `http://localhost:8080`. The
API documentation is at `http://localhost:8080/api/docs`. Run
`docker compose down` to stop and `docker compose down -v` to also delete the
database. Change `JWT_SECRET` in `.env` before using the stack for anything
other than a demo.

### Run for development

Prerequisites: Node.js 24, npm and Docker.

1. Create the environment file:

   ```bash
   cp .env.example .env
   ```

2. Start MySQL:

   ```bash
   docker compose up -d mysql
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

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The application is then available at `http://localhost:5173`. Set `VITE_API_URL`
(see `frontend/.env.example`) if the API runs somewhere else.

## Test accounts

The seed script creates one admin, 10 teachers, 6 classes, 123 students, 10
subjects and about 4800 grades. All teachers share one password and all students
share another.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.test` | `Admin123!` |
| Teacher | `laura.marin@school.test` (class teacher of 9A, teaches Mathematics in every class and Physics in 9A) | `Teacher123!` |
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
| `POST /auth/register` (creates a student account) | public | public | public |
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

- A teacher teaches subjects in classes (`TeachingAssignment`). They can grade and
  see only those subjects, for the students of those classes.
- The class teacher (`Class.teacherId`) also sees every grade of the class, but can
  change only the grades they gave.
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

Frontend tests check the form validation rules (which mirror the backend ones), the
role guards on every route, the API client and the shared components: 
```bash
cd frontend
npm test
```

Unit tests cover the authorization and grading rules. End-to-end tests start the
real application against MySQL and check authentication, role restrictions and
the grading flow. They create their own data and remove it afterwards, so the
database must be running and migrated. GitHub Actions runs lint, build, unit
tests, migrations and end-to-end tests on every pull request that touches the
backend, and the checks and tests of the frontend on every pull request that
touches the frontend. Another workflow builds the Docker images.

## Design decisions

- **Prisma and MySQL.** The schema is the single source of truth and the client
  is fully typed. Migrations are versioned, and a database constraint keeps grade
  values between 1 and 10.
- **One `User` table for login.** Teachers and students are profiles linked to a
  user. Their email lives on the user and is returned flattened in responses.
  Deleting a profile deletes its account in the same operation.
- **Subjects as a table.** Grades reference a subject, which keeps names
  consistent and makes averages per subject reliable.
- **Averages.** The average of a subject is rounded to a whole number (6.5
  becomes 7), and the overall average is the mean of those rounded subject
  averages, shown with two decimals.
- **Long-lived access tokens, no refresh tokens.** A token is valid for two
  years (`JWT_EXPIRES_IN`), so users stay signed in until they sign out. The
  browser keeps it in local storage and the app signs out by itself when the
  server rejects it. A deactivated account loses access immediately, because the
  token is checked against the database on every request.
- **Input validation.** Names accept letters, spaces, hyphens and apostrophes (2-100 characters). Passwords need 8-72 characters with at least one letter and one digit, birth dates must be between 1900 and today, and unknown fields are rejected. The frontend applies the same rules before sending a form.
- **Rate limiting.** Login is limited to 5 attempts per minute, the rest of the
  API to 100 requests per minute.

## Status

The backend is complete and covered by tests. The frontend has the start page
with sign in and sign up connected to the API, and a signed-in page that restores
the session after a reload. The screens for each role are the next step. The plan
is tracked in [docs/PLAN.md](docs/PLAN.md).
