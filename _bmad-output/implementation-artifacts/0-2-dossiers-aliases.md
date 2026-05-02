# Story 0.2: Dossiers & Aliases

Status: review

## Story

As a Dev,
I want @core, @domains, @ui, @game, @utils aliases,
so that imports are clean and decoupled from relative path nesting.

## Acceptance Criteria

1. **Comprehensive Aliases:** Path aliases for all core directories must be configured in `tsconfig.json`, `vite/config.dev.mjs`, `vite/config.prod.mjs`, and `vitest.config.ts`.
    - Required: `@core` -> `src/core`
    - Required: `@domains` -> `src/domains`
    - Required: `@ui` -> `src/presentation`
    - Required: `@game` -> `src/game`
    - Required: `@utils` -> `src/utils`
2. **Folder Structure Integrity:** All core directories (`core`, `domains`, `utils`) must be initialized with a `.gitkeep` or a basic index file to ensure they are tracked by git.
3. **Import Refactoring:** Existing imports in `App.tsx`, `PhaserGame.tsx`, and `main.tsx` must be converted to use aliases where appropriate (e.g., `./game/scenes/MainMenu` -> `@game/scenes/MainMenu`).
4. **Build & Test Verification:** The project must build and pass tests using the new alias configuration.

## Tasks / Subtasks

- [x] **Alias Configuration Update** (AC: 1)
  - [x] Update `tsconfig.json` with `@game/*` and `@utils/*`.
  - [x] Update `vite/config.dev.mjs` and `vite/config.prod.mjs` with `@game` and `@utils`.
  - [x] Update `vitest.config.ts` with `@game` and `@utils`.
- [x] **Dossier Initialization** (AC: 2)
  - [x] Add `.gitkeep` to `src/core`, `src/domains`, and `src/utils` if empty.
- [x] **Import Refactoring** (AC: 3)
  - [x] Scan `src/*.tsx` and `src/*.ts` for relative imports targeting aliased folders.
  - [x] Replace relative imports with aliases in `src/App.tsx`, `src/PhaserGame.tsx`, etc.
- [x] **Verification** (AC: 4)
  - [x] Run `npm run dev` to verify HMR and runtime imports.
  - [x] Run `npm run build` to verify production bundling.
  - [x] Run `npm run test` to verify Vitest alias resolution.

### Review Follow-ups (AI)

- [x] [AI-Review] Refactor `import App from './App'` to `import App from '@ui/App'` in `src/main.tsx`. (Severity: Low)
- [x] [AI-Review] Refactor `import { IRefPhaserGame, PhaserGame } from './PhaserGame'` to use aliases in `src/App.tsx`. (Severity: Low)
- [x] [AI-Review] Move `App.tsx` and `PhaserGame.tsx` to `src/presentation/` to fully leverage the `@ui` alias. (Severity: Low)

## Dev Notes

- **Architecture Pattern:** Follow the "Domain-Driven Hybrid" pattern. `presentation/` is the React/UI layer, mapped to `@ui`.
- **ESM Gotcha:** Remember to use `path.resolve(__dirname, ...)` in Vite configs. Since these are `.mjs` or in an ESM project, `__dirname` is derived from `import.meta.url` (already handled in existing configs, keep it consistent).
- **ESLint Integration:** Ensure the `eslint.config.js` rules (from Story 0.1) still work correctly with the new aliases.

### Project Structure Notes

- **src/core/**: Infrastructure (Services, FSM, Database).
- **src/domains/**: Business logic (Match, Loot, Career).
- **src/presentation/**: UI (React) and Layouts. Mapped to `@ui`.
- **src/game/**: Phaser-specific logic (Scenes, EventBus). Mapped to `@game`.
- **src/utils/**: Shared helpers. Mapped to `@utils`.

### Project Context Rules

Extracted from `project-context.md`:
- **Naming:** Files `PascalCase.ts`, folders `kebab-case`.
- **Dependency Matrix:**
    - `presentation/` -> `core/` : ✅ Authorized.
    - `domains/X` -> `domains/Y` : ❌ FORBIDDEN (Use EventBus).
    - `core/` -> `domains/` : ❌ FORBIDDEN.
- **Testing:** Vitest is mandatory. Seeding must be used for randomness.

### References

- [Source: _bmad-output/epics.md#Epic 00]
- [Source: _bmad-output/project-context.md#Code Organization & Naming Rules]
- [Source: _bmad-output/implementation-artifacts/0-1-initialisation-strict-ts.md]

## Senior Developer Review (AI)

**Date:** 2026-05-02
**Outcome:** Approve with Minor Improvements

Implementation is solid and follows the architectural patterns. Path aliases are correctly synchronized.

### Action Items
- [x] Refactor residual relative imports in `src/main.tsx` and `src/App.tsx`.
- [x] Distinguish clearly between `@ui` and Phaser UI in `@game`.
- [x] Move root components to `src/presentation/`.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- tsconfig.json updated with new aliases.
- Vite configs (dev/prod) updated.
- Vitest config updated.
- .gitkeep files created in core, domains, utils.
- App.tsx, PhaserGame.tsx, main.tsx refactored to use @game and @ui aliases.
- Moved App.tsx and PhaserGame.tsx to src/presentation/.
- `npm run test` passed.
- `npm run build` passed.

### Completion Notes List

- All requested path aliases (@core, @domains, @ui, @game, @utils) are now active across the entire toolchain (TS, Vite, Vitest).
- Folder structure is now git-ready with .gitkeep files in core directories.
- Existing React components and entry points have been refactored to use the new aliases, improving code maintainability.
- Root components (App, PhaserGame) moved to `@ui` (src/presentation/) for structural consistency.

### File List

- tsconfig.json (modified)
- vite/config.dev.mjs (modified)
- vite/config.prod.mjs (modified)
- vitest.config.ts (modified)
- src/core/.gitkeep (new)
- src/domains/.gitkeep (new)
- src/utils/.gitkeep (new)
- src/presentation/App.tsx (moved/modified)
- src/presentation/PhaserGame.tsx (moved/modified)
- src/main.tsx (modified)
