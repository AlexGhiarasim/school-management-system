# School Management System - Frontend

Single-page application built with React, TypeScript and Vite.

## Source layout

```
src/
  main.tsx         Application entry point
  app/             Root component and providers
  assets/          Static assets (images, fonts)
  components/      Reusable UI
    ui/            Generic building blocks (button, input, table)
    layout/        Header, sidebar and page frame
  config/          Environment and runtime configuration
  constants/       Shared constants
  features/        Domain modules (auth, students, teachers, classes, grades)
  hooks/           Shared hooks
  layouts/         Page layouts per role
  lib/             Third-party setup (HTTP client)
  pages/           Route-level screens
  routes/          Route definitions and guards
  services/        API calls
  styles/          Global styles
  types/           Shared types
  utils/           Pure helper functions
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint the sources |
| `npm run format` | Format the sources with Prettier |
