# School Management System

Web application for managing students, teachers, classes and grades, with JWT
authentication and role-based access control.

## Tech stack

- Backend: NestJS 12 (TypeScript), Prisma 7, MySQL 8.4, Redis 7 (cache)
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

The application sends emails for password resets. In this stack they are caught
by Mailpit, so nothing leaves your machine: open `http://localhost:8025` to read
them.

### Run for development

Prerequisites: Node.js 24, npm and Docker.

1. Create the environment file:

   ```bash
   cp .env.example .env
   ```

2. Start MySQL, Mailpit (the inbox for the emails sent by the application, at
   `http://localhost:8025`) and Redis (the cache, optional):

   ```bash
   docker compose up -d mysql mailpit redis
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
| Admin | `admin@school.test` (a second one: `admin2@school.test`) | `Admin123!` |
| Teacher | `laura.marin@school.test` (class teacher of 9A, teaches Mathematics in every class and Physics in 9A) | `Teacher123!` |
| Student | `mihai.constantin@student.school.test` | `Student123!` |

Students and teachers also get a made-up phone number (the administrator has
none). They use a range reserved for fiction, such as `+44 7700 900123`, and are
not in a Romanian format.

Other accounts follow the same pattern: teachers use `@school.test` and students
use `@student.school.test`. Run `npm run prisma:seed` again at any time to reset
the data.

## API overview

All endpoints are under `/api`. Lists accept `page` and `limit` and return
`{ data, meta }`.

A Postman collection with every endpoint is in
[docs/postman](docs/postman/School-Management-System.postman_collection.json).
Import it, send one of the "Login as" requests, then any other request. After
the API changes, `npm run postman` in `backend` builds it again from Swagger.

| Endpoint | Admin | Teacher | Student |
|---|---|---|---|
| `POST /auth/login` | public | public | public |
| `GET /auth/config` (tells the client whether sign-up is open) | public | public | public |
| `POST /auth/register` (creates a student account, only when `ALLOW_PUBLIC_REGISTRATION=true`) | public | public | public |
| `POST /auth/forgot-password` (emails a reset link) | public | public | public |
| `POST /auth/reset-password` (sets a new password with the link token) | public | public | public |
| `POST /auth/change-password` | yes | yes | yes |
| `GET /auth/me` | yes | yes | yes |
| `GET /health` | public | public | public |
| `GET /admins` | yes | no | no |
| `/subjects` (read) | yes | yes | yes |
| `/subjects` (create, update, delete) | yes | no | no |
| `/teachers` (CRUD) | yes | no | no |
| `GET /teachers/me/classes` | no | yes | no |
| `/classes` (CRUD) | yes | no | no |
| `PATCH /classes/:id/teacher` | yes | no | no |
| `GET /classes/:id/students` | yes | own classes | no |
| `GET /classes/:id/overview` (statistics, students and teachers of a class) | yes | class teacher | no |
| `/students` (CRUD) | yes | no | no |
| `PATCH /students/:id/class` | yes | no | no |
| `GET /students/me` | no | no | yes |
| `GET /grades` | yes | own students | no |
| `POST /grades` | yes | own students | no |
| `PATCH /grades/:id` | yes | grades they gave | no |
| `DELETE /grades/:id` | yes | no | no |
| `GET /grades/me` (grades and averages) | no | no | yes |
| `GET /grades/export` (filtered grades as CSV) | yes | class teacher, own class | no |
| `GET /grades/history` (every change to grades) | yes | no | no |
| `GET /grades/:id/history` (the changes to one grade) | yes | no | no |
| `GET /statistics` (averages, distribution, students at risk) | yes | no | no |

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
    modules/         auth, health, subjects, teachers, classes, students, grades,
                     statistics
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
- **Password reset.** "Forgot your password" emails a link with a random token.
  Only its SHA-256 hash is stored, it expires after 60 minutes and works once.
  The request always answers 204, so it does not reveal which emails have an
  account. Changing or resetting a password signs out every other session, because
  tokens issued before `passwordChangedAt` are rejected. Emails go through SMTP
  and the settings are optional: without them the messages go to Mailpit, the
  local inbox, and a failed delivery is only logged. To send real emails, set
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` and
  `APP_URL` in `.env` (see `.env.example`).
- **Public registration is off by default.** Accounts come from the seed script
  and from administrators, as the assignment describes. The student sign-up
  (`POST /auth/register` and the "Create account" tab) stays in the code behind
  `ALLOW_PUBLIC_REGISTRATION`. Set it to `true` in `.env` to open it: a new
  student then has no class until an administrator assigns one. While it is off
  the endpoint answers 403 and the start page shows only the sign-in form.
- **Cache.** The statistics and the overview of a class add up thousands of
  grades on every request, so Redis keeps the result for five minutes (about
  120 ms without it and 9 ms with it, on the seed data). Every key carries a
  version, and any successful change, a grade, a student or a class, raises the
  version, which makes all the older entries unreachable at once. The class and
  who may see it are always read from the database, so authorization never
  depends on the cache. Redis is optional: without `REDIS_URL`, or if it goes
  down, the application keeps working and computes the data again. Running
  `npm run prisma:seed` clears the cache too.
- **Statistics.** `GET /statistics` covers the school or one class: the pass
  rate, the grade distribution, the average per class, per
  subject and per week, the best students and the students at risk. A student is
  at risk when the rounded average of a subject is below 5, the same rule as on
  their own grades page. The numbers are computed in one pass over the grades,
  in plain functions covered by unit tests.
- **Class teacher.** A teacher teaches subjects in some classes and can lead one
  class. The teacher pages keep the two apart: "My classes" lists the classes
  where they teach, with the subjects, and the "Class teacher" page appears only
  for the one they lead. There they see how the class is doing (pass rate, grade
  distribution, average per subject), the students failing a subject, who teaches
  what, and every student with all their grades and a printable school report.
  They can export the grades of their class as CSV. The grades of other teachers
  stay read-only, and `GET /classes/:id/overview` and the class export answer 403
  for any other teacher.
- **Grade history.** Every grade that is added, changed or deleted writes an entry
  to `GradeAudit` in the same transaction, with who made the change and the value
  before and after. The entry copies the names of the student and the subject, so
  it still reads correctly after they are deleted. Administrators see the full
  log on the Activity page and the history of one grade when they edit it.
- **Exports.** Administrators download the filtered grades as CSV. The file starts
  with a byte order mark so Excel shows diacritics, uses `;` in Romanian and `,`
  in English, and escapes values that a spreadsheet would run as formulas. The
  school report of a student is a page laid out for printing, so the browser can
  print it or save it as PDF without an extra library.
- **Input validation.** Names accept letters, spaces, hyphens and apostrophes (2-100 characters). Passwords need 8-72 characters with at least one letter and one digit, birth dates must be between 1900 and today, and unknown fields are rejected. The frontend applies the same rules before sending a form.
- **Rate limiting.** Login is limited to 5 attempts per minute, the rest of the
  API to 100 requests per minute.

## Status

The application is complete. Administrators manage students, teachers, classes,
subjects and grades, follow the statistics of the school and the history of every
grade, and export grades and school reports. Teachers grade the students of their
classes and students see their grades, averages and school report. The original
plan is in [docs/PLAN.md](docs/PLAN.md).
