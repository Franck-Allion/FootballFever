# Story 0.1: Initialisation & Strict TS

Status: review

## Story

As a Lead Dev,
I want to initialize a project Vite/React/TS with strict mode,
so that the code is robust.

## Acceptance Criteria

1. **Strict TypeScript:** TS config `strict: true` must be enabled, and usage of `any` must be prohibited.
2. **Project Bootstrap:** The project must be initialized using the official Phaser 3 + React + TypeScript + Vite template.
3. **Core Stack Integration:** React 19, Phaser 3.90, TailwindCSS, Zustand 5, and Dexie 4 must be configured and ready.
4. **Build Integrity:** The project must compile and start without errors in development mode.

## Tasks / Subtasks

- [x] **Project Initialization** (AC: 2, 3)
  - [x] Run `npm create phaser@latest` and select React + TypeScript. (Implemented via degit phaserjs/template-react-ts)
  - [x] Install dependencies: `zustand`, `dexie`, `zod`, `tailwindcss`, `class-variance-authority`, `tailwind-merge`, `clsx`, `vitest`.
  - [x] Initialize TailwindCSS and configure `tailwind.config.js` with project tokens.
- [x] **TypeScript Configuration** (AC: 1)
  - [x] Set `"strict": true` in `tsconfig.json`.
  - [x] Add `"noUncheckedIndexedAccess": true` and `"exactOptionalPropertyTypes": true`.
  - [x] Configure path aliases: `@core/*`, `@domains/*`, `@ui/*`.
- [x] **Technical Constitution Check** (AC: 1, 4)
  - [x] Ensure `eslint-plugin-import` is configured to prevent illegal cross-domain imports (refer to Dependency Matrix). (Implemented via `no-restricted-imports` in `eslint.config.js`)
  - [x] Validate that the app starts via `npm run dev`.

## Dev Notes

- Use the official template as the source of truth for the React/Phaser bridge.
- Ensure the folder structure follows the **Domain-Driven Hybrid** pattern defined in the architecture.
- Testing: Initialize Vitest and ensure it executes a basic sanity test.

### Project Structure Notes

- **src/core/**: Infrastructure and cross-cutting concerns.
- **src/domains/**: Business logic (match, loot, career).
- **src/presentation/**: UI (React) and Game View (Phaser).
- **src/utils/**: Shared math and helpers.

### Project Context Rules

Extracted from `project-context.md`:
- **Engine:** Phaser v3.90.0 (Tsugumi), React v19.0.0.
- **Dependency Matrix:** Strict isolation between domains. `presentation/` -> `core/` (Allowed), `domains/X` -> `domains/Y` (FORBIDDEN).
- **Phaser Singleton Guard:** Use a pattern to prevent double initialization in Strict Mode.
- **Strict Mode:** Mandatory strict typing. No implicit `any`.

### References

- [Source: _bmad-output/game-architecture.md#Core Stack]
- [Source: _bmad-output/project-context.md#Technical Constitution]
- [Source: _bmad-output/epics.md#Epic 00]

## Dev Agent Record

### Debug Log References
- Degit successful.
- Npm install successful.
- Tailwind init successful.
- Vitest sanity test pass.
- Build integrity verified.
- Dev server verified on port 8081.
- Fixed PostCSS config (converted to ESM).

### Completion Notes List
- Initialized with Phaser 3 + React + TS template.
- Strict TS enabled with noUncheckedIndexedAccess and exactOptionalPropertyTypes.
- Path aliases configured in both tsconfig and vite config.
- TailwindCSS integrated.
- Vitest configured with happy-dom and a sanity test.
- ESLint configured to enforce domain matrix isolation.
- Converted PostCSS config to ESM to avoid loading errors.

### File List
- package.json (modified)
- tsconfig.json (modified)
- tailwind.config.js (new)
- postcss.config.js (new/fixed)
- eslint.config.js (new)
- vitest.config.ts (new)
- vite/config.dev.mjs (modified)
- vite/config.prod.mjs (modified)
- src/index.css (new)
- src/main.tsx (modified)
- src/sanity.test.ts (new)
- src/core/ (new dir)
Status: done

## Story
...
### Review Findings (2026-05-02)

- [x] [Review][Patch] ESM Reference Error: `__dirname` not defined in ESM scope. [vite/config.*, vitest.config.ts] — Fixed using `import.meta.url`.
- [x] [Review][Patch] Phaser Version Mismatch: Version 3.88.2 used instead of required 3.90.0. [package.json] — Updated to 3.90.0.
- [x] [Review][Patch] Missing Singleton Guard: Mandatory Phaser Singleton Guard for React Strict Mode. [src/PhaserGame.tsx] — Verified template already uses `ref` check for singleton pattern.
- [x] [Review][Patch] Shallow Domain Isolation: ESLint patterns can be bypassed with relative paths. [eslint.config.js] — Strengthened patterns to `**/domains/**`.
- [x] [Review][Patch] Unsafe Mount: Non-null assertion on `#root` can cause crash if DOM element is missing. [src/main.tsx] — Added null check and error logging.
- [x] [Review][Patch] Static Analysis Gap: `vite` folder is ignored by ESLint. [eslint.config.js] — Removed ignore for `vite` and added `.js`/`.mjs` files to linting scope.

