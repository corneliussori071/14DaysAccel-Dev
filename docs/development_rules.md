# Development Rules

> Permanent engineering standards for the 14DaysAccel Dev repository.
> All contributors and AI assistants must follow these rules at all times.

---

## 1. UI Rules

- No emojis anywhere in the UI.
- Avoid decorative icons. Use icons only when they serve a clear functional purpose.
- Follow professional enterprise SaaS design principles.
- Use clean typography with consistent spacing and alignment.
- Stick to a neutral color palette (grays, whites, subtle accents).
- The interface should resemble professional dashboards such as Stripe or Linear.
- Prioritize readability, information density, and clarity over visual flair.

## 2. GitHub Rules

- Make small, incremental commits. Each commit should represent a single logical change.
- Write clear, descriptive commit messages (e.g., `feat: add project catalogue page layout`).
- Never make large monolithic commits that bundle unrelated changes.
- Maintain a readable, linear commit history.
- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`.

## 3. Security Rules

- **Never commit secrets, API keys, or environment variables.**
- All sensitive configuration must use `.env` files.
- `.env` and `.env.local` must always be listed in `.gitignore`.
- Use `.env.example` to document required environment variables with placeholder values.
- Review all commits before pushing to ensure no secrets are included.
- Never log secrets or tokens to the console in any environment.

## 4. Backend Safety

- Database credentials must never appear in source code.
- Use environment variables for all API keys and service credentials.
- Use secure authentication flows (Supabase Auth with RLS).
- Validate and sanitize all user input on the server side.
- Never trust client-side data for authorization decisions.

## 5. Code Quality Rules

- Use TypeScript with strict mode enabled for all code.
- Follow modular architecture: separate UI components, services, configuration, and types.
- Build reusable components. Avoid duplicating UI logic.
- Maintain clear separation of concerns: UI layer, service/data layer, type definitions.
- Use clean, descriptive naming conventions for files, functions, variables, and types.
- Keep files focused. One component or module per file.
- Avoid `any` type. Use proper TypeScript types and interfaces.

## 6. Public Repository Guidelines

This repository is public and visible to potential clients and employers.

- All code must be professional and production-quality.
- Folder structure must be clear and well-organized.
- Documentation must be included and kept up to date.
- No placeholder junk code, TODO hacks, or commented-out blocks in committed code.
- Every file should serve a clear purpose.
- The repository should demonstrate engineering competence at a glance.
