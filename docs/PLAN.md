# Project Plan: School Management System

## Goal
A web app to manage students, teachers, classes and grades.
Users log in with JWT and see only what their role allows (Admin, Teacher, Student).
Authorization is enforced on the backend.

## Stack
- Backend: NestJS (TypeScript)
- Database: MySQL 8 with Prisma
- Auth: JWT, passwords hashed with bcrypt
- Frontend: React (Vite)
- Local setup: Docker Compose
- CI: GitHub Actions

## Data model
- **User**: email, passwordHash, role (ADMIN, TEACHER, STUDENT)
- **Teacher**: firstName, lastName, linked to a User
- **Student**: firstName, lastName, dateOfBirth, linked to a User, belongs to one Class (optional)
- **Class**: name, one Teacher (optional), many Students
- **Grade**: student, teacher, subject, value (1-10), date

## Who can do what
- **Admin**: manage students, teachers, classes and assignments; view and manage all grades.
- **Teacher**: see own classes and their students; add and update grades only for students in own classes.
- **Student**: see own profile, class, grades and average.

Rules enforced in services:
1. A teacher can only grade students in their own classes.
2. A teacher can only edit grades they gave.
3. A student's id always comes from the JWT, never from the URL.

## Roadmap
Backend first, then the frontend follows one step behind each backend module.

1. Backend setup: NestJS, Docker Compose, Prisma schema, migration
2. Seed script and JWT login
3. Roles guard, validation, health endpoint. Frontend: setup and login page
4. Classes and Teachers CRUD. Frontend: layout by role, admin pages for classes and teachers
5. Students CRUD and class assignment. Frontend: admin page for students
6. Grades with ownership rules and average. Frontend: teacher pages
7. Swagger and tests. Frontend: student pages
8. CI, Dockerfiles, full Docker Compose
9. Final README and fresh clone test

This plan can change as the project evolves.
