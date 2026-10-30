# Architecture

GitHub draws the diagrams below on its own.

## How the parts connect

```mermaid
flowchart LR
  A["   Browser (React)   "] --> B["   Nginx   "]
  B --> C["   Backend (NestJS)   "]
  C --> D[("   MySQL   ")]
  C --> E[("   Redis (cache)   ")]
```

In Docker Compose each box is a container. In development the frontend runs on
Vite and calls the API directly. Redis is optional, and without it the backend
computes the statistics each time.

## Database

```mermaid
erDiagram
  USER ||--o| ADMIN : is
  USER ||--o| TEACHER : is
  USER ||--o| STUDENT : is
  TEACHER |o--o{ SCHOOL_CLASS : "leads"
  SCHOOL_CLASS |o--o{ STUDENT : "has"
  TEACHER ||--o{ TEACHING_ASSIGNMENT : "has"
  SCHOOL_CLASS ||--o{ TEACHING_ASSIGNMENT : "has"
  SUBJECT ||--o{ TEACHING_ASSIGNMENT : "has"
  STUDENT ||--o{ GRADE : "receives"
  SUBJECT ||--o{ GRADE : "has"
  TEACHER |o--o{ GRADE : "gives"
```

- `USER` holds the login (email, password, role). Each user has one profile:
  administrator, teacher or student.
- `SCHOOL_CLASS` is the `Class` table (Mermaid reserves the word `class`). Its
  teacher is the class teacher.
- `TEACHING_ASSIGNMENT` says which teacher teaches which subject in which class.
- `GRADE` holds a value from 1 to 10. Every change to a grade is also saved in
  `GradeAudit`, with who made it, so the history stays readable even after the
  grade or the student is deleted.
