# School Management System - Frontend

Single-page application built with React, TypeScript and Vite.

## Source layout

```
src/
  main.tsx         Application entry point
  app/             Root component and providers
  assets/          Static assets
  components/      Reusable UI
    ui/            Generic building blocks (button, input, table, modal)
    layout/        Page header, logo and language switcher
  config/          Environment and runtime configuration
  features/        Components and hooks for each area: admin, auth, landing,
                   statistics, student, teacher
  hooks/           Shared hooks
  layouts/         Page layouts per role
  lib/             Helpers for the API client, i18n and file downloads
  locales/         Romanian and English texts
  pages/           One file per screen
  routes/          Route definitions and guards
  services/        API calls
  styles/          Global styles
  test/            Test helpers
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
| `npm test` | Run the tests |
