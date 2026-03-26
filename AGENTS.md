# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

This is a **Svelte 5 + Vite + TypeScript + Tailwind CSS + ESLint** starter template for building single-page applications without SvelteKit. It includes Flowbite Svelte for UI components, Vitest for testing, and GitHub Actions for CI/CD.

## Tech Stack

- **Framework**: Svelte 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4, Flowbite Svelte
- **Language**: TypeScript 5 (strict mode)
- **Testing**: Vitest + @testing-library/svelte (jsdom)
- **Linting**: ESLint 10 (flat config) + Prettier 3 + svelte-check

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server with HMR
npm run build      # Production build (outputs to dist/)
npm run preview    # Preview production build
npm run lint       # Run prettier + eslint + svelte-check
npm run format     # Auto-format code with Prettier
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
npm run coverage   # Generate test coverage report
```

Always run `npm run lint` before finishing a task. Fix all lint errors before considering work complete.

## Project Structure

```
src/
  assets/          # Static assets (SVGs, images)
  components/      # Reusable Svelte components
  tests/           # Vitest test files and setup
  App.svelte        # Root component
  main.ts           # Entry point — mounts app to #app
  app.css           # Global styles (Tailwind imports, theme)
  vite-env.d.ts     # Vite/Svelte type references
```

## Path Aliases

Use these aliases — do not use relative `../../` paths when an alias applies:

| Alias          | Resolves to       |
|----------------|-------------------|
| `@/`           | `src/`            |
| `@components/` | `src/components/` |
| `@utils/`      | `src/utils/`      |
| `@tests/`      | `src/tests/`      |
| `@types/`      | `src/types/`      |
| `@assets/`     | `src/assets/`     |

## Code Conventions

- **Svelte 5 runes**: Use `$state`, `$derived`, `$effect`, `$props` — not legacy `writable`/`reactive` patterns.
- **Styling**: Use Tailwind utility classes. Avoid inline styles and custom CSS unless Tailwind cannot achieve the result.
- **TypeScript**: Strict mode is on. Do not use `any` unless absolutely necessary.
- **Formatting**: Prettier is the source of truth for formatting. Line width is 200, single quotes, no trailing commas.
- **ESLint**: Flat config in `eslint.config.js`. Both `@typescript-eslint/no-explicit-any` and `no-undef` are disabled by project convention.
- **Component files**: `.svelte` only — no `.jsx`/`.tsx`.

## Testing

- Tests live in `src/tests/` alongside a `setup.ts` file that mocks `window.matchMedia` and imports jest-dom.
- Test files follow the pattern `*.{test,spec}.{js,ts}`.
- Use `@testing-library/svelte` for component tests.
- Run `npm run test` to verify changes don't break existing tests. Add tests for new components/logic.

## CI/CD

Three GitHub Actions workflows run automatically:

- **`test.yml`**: Runs lint + tests on all pushes except to `main`.
- **`static.yml`**: Builds and deploys to GitHub Pages on push to `main`.
- **`release.yml`**: Creates a GitHub release with build artifacts when a tag is pushed.

Do not modify workflow files unless the task explicitly requires it.

## Reference Documentation

When working with Svelte or Flowbite Svelte, consult the LLM-optimized docs for up-to-date API references:

- **Svelte 5**: https://svelte.dev/llms.txt
- **Flowbite Svelte**: https://flowbite-svelte.com/llms.txt

## Dependency Updates

Renovate is configured for automated dependency updates:
- **Major** updates: Mondays after 9am
- **Minor/patch** updates: Mondays after 8am (grouped)

Do not manually bump dependencies unless the task requires it.
