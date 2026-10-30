# School Management System - Backend

REST API built with NestJS and TypeScript.

## Source layout

```
src/
  main.ts            Application entry point
  app.module.ts      Root module
  config/            Typed configuration and environment validation
  cache/             Redis cache and its invalidation
  database/          Database module and ORM integration
  common/            Cross-cutting code shared by all modules
    constants/       Shared constants
    decorators/      Custom decorators (current user, roles, public routes)
    dto/             Shared DTOs (pagination, responses)
    enums/           Shared enums (user roles)
    filters/         Exception filters
    guards/          Authentication and authorization guards
    interceptors/    Request and response interceptors
    interfaces/      Shared type contracts
    pipes/           Custom pipes
  modules/           Feature modules, one folder per domain area
test/                End-to-end tests
```

Each feature module under `src/modules` owns its controller, service, DTOs
and unit tests. Modules depend on `common` and `database`, never on each other's
internals.

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm run lint` | Lint the sources |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run prisma:deploy` | Apply the migrations |
| `npm run prisma:seed` | Load the sample data |
| `npm run postman` | Build the Postman collection from Swagger |
