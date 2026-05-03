# Story 1.1: Localization Infrastructure

Status: review

## Story

As a Global Player,
I want the UI in my language (FR/EN/ES/DE),
so that I understand the gameplay mechanics and narrative.

## Acceptance Criteria

1. **Lightweight Infrastructure:** Implement a `LocalizationService` in `src/core/services/i18n/` that manages translation keys and language state.
2. **Multi-language Support:** Dictionaries for French (FR), English (EN), Spanish (ES), and German (DE) must be initialized with at least basic UI keys (e.g., "Press Start", "Current State", "Loading").
3. **No Hardcoded Strings:** The `App.tsx` component and other UI elements must be refactored to use translation keys instead of hardcoded English strings.
4. **Language Switching:** The system must support runtime language switching without requiring a full page reload (HMR-friendly or state-driven).
5. **Persistence:** The user's language preference must be persisted (initially in `localStorage` or `useFlowStore`, later in `DatabaseService`).
6. **Zod Validation:** (Optional but recommended) Validate translation files or keys to ensure no missing translations for active languages.

## Tasks / Subtasks

- [x] **Infrastructure Setup** (AC: 1, 2)
  - [x] Create `src/core/services/i18n/LocalizationService.ts`.
  - [x] Implement translation dictionaries for `fr`, `en`, `es`, `de` in `src/core/services/i18n/locales/`.
  - [x] Implement language detection (browser-based) and default fallback to `en`.
- [x] **React Integration** (AC: 4, 5)
  - [x] Create a `useTranslation` hook or integrate with `useFlowStore` to expose current language and translation function `t(key)`.
  - [x] Implement a simple language selector component in `src/presentation/ui/settings/LanguageSelector.tsx` (can be integrated into the debug console or a settings menu).
- [x] **UI Refactoring** (AC: 3)
  - [x] Identify all hardcoded strings in `src/presentation/App.tsx`.
  - [x] Replace strings with `t('key')` calls.
- [x] **Verification** (AC: 4, 6)
  - [x] Write unit tests for `LocalizationService` verifying key lookup and fallback.
  - [x] Verify that switching language updates the UI immediately.
  - [x] Implement Zod validation for translation dictionaries (AC: 6).

### Review Follow-ups (AI)

- [x] [AI-Review] Standardize i18n on a dedicated alias (`@i18n`) across TS, Vite, Vitest, and module imports. (Severity: High)
- [x] [AI-Review] Fix unresolved import in `LanguageSelector` (`@presentation/...`) to align with configured aliases. (Severity: High)

## Dev Notes

- **Library Choice:** Implemented a custom lightweight `LocalizationService` to avoid heavy dependencies, keeping memory footprint low.
- **Naming Convention:** Files `PascalCase.ts`, folders `kebab-case`.
- **Architectural Rule:** `presentation/` -> `core/` is allowed. `core/` must not depend on `presentation/`.

### Project Context Rules

- **Validation:** Basic fallback validation implemented in `LocalizationService.t`.
- **Memory:** Footprint is minimal (just JS objects for locales).

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- Implemented `LocalizationService` as a singleton.
- Added locales for EN, FR, ES, DE.
- Created `useTranslation` hook for reactive UI updates.
- Refactored `App.tsx` and added `LanguageSelector`.
- Added `@i18n` alias in TypeScript, Vite (dev/prod), and Vitest configs.
- Standardized i18n imports (`LocalizationService`, locale files, `LanguageSelector`, `useTranslation`).
- Added test-only reset helper `LocalizationService.resetInstanceForTests()`.
- Verified `npx eslint src`, `npx vitest run` and `npm run build` pass after review fixes.

### Completion Notes List

- Delivered a complete, lightweight localization system.
- UI strings in `App.tsx` are now fully localized.
- User language preference is persisted in `localStorage`.
- Support for runtime language switching without reload.
- Dedicated i18n alias now enforced consistently across tooling and code imports.
- Build-breaking alias issue in UI settings was resolved and verified in production build.

### File List

- tsconfig.json (modified)
- vite/config.dev.mjs (modified)
- vite/config.prod.mjs (modified)
- vitest.config.ts (modified)
- src/core/services/i18n/LocalizationService.ts (new)
- src/core/services/i18n/LocalizationService.test.ts (new)
- src/core/services/i18n/locales/en.ts (new)
- src/core/services/i18n/locales/fr.ts (new)
- src/core/services/i18n/locales/es.ts (new)
- src/core/services/i18n/locales/de.ts (new)
- src/presentation/hooks/useTranslation.ts (new)
- src/presentation/ui/settings/LanguageSelector.tsx (new)
- src/presentation/App.tsx (modified)

### Change Log

- 2026-05-03: Story implementation complete and verified with tests.
- 2026-05-03: Code review follow-ups applied; standardized i18n aliasing and fixed production import resolution.

