# Story 4.1: Test Coverage & CI Guardrails

Status: review

## Story

As a Maintainer,
I want 95%+ test coverage on core and domain logic and automated guardrails,
so that regressions are caught immediately and the codebase remains robust during rapid development.

## Acceptance Criteria

1. **Vitest Coverage Configuration:** Update `vitest.config.ts` to enable coverage reporting with specific thresholds:
    - `lines`: 95
    - `functions`: 95
    - `branches`: 95
    - `statements`: 95
2. **Targeted Coverage:** Thresholds must apply to `src/domains/` and `src/core/services/` (excluding UI-only components if necessary, but prioritizing logic).
3. **CI Integration Script:** Create or update `package.json` scripts to include a `test:ci` command that runs tests with coverage and fails if thresholds are not met.
4. **Documentation:** Add a `TESTING.md` (or update `README.md`) explaining the testing standards and how to run coverage locally.
5. **No Regressions:** All existing tests must pass with the new configuration.

## Tasks / Subtasks

- [x] **Config Update** (AC: 1, 2)
  - [x] Update `vitest.config.ts` with `test.coverage` section.
  - [x] Configure `v8` provider (installed via `npm`).
  - [x] Set `include` and `exclude` patterns for coverage to target business logic.
- [x] **Script Automation** (AC: 3)
  - [x] Update `package.json` with `"test:ci": "vitest run --coverage"`.
  - [x] Verify that the command exits with a non-zero code if coverage is below 95% (verified by initial failures).
- [x] **Logic Cleanup** (AC: 5)
  - [x] Run coverage on current codebase.
  - [x] Identify gaps in `src/core` or `src/domains`.
  - [x] Add missing unit tests for `DomainRegistry`, `PersistenceService`, `LocalizationService`, and `LoggerService` to reach the 95% threshold.
- [x] **Documentation** (AC: 4)
  - [x] Document the "Pattern AAA (Arrange-Act-Assert)" requirement for all tests in `docs/TESTING.md`.

## Dev Notes

- **Coverage Provider:** Using `@vitest/coverage-v8` version 2.1.9 to match Vitest core.
- **Strict Mode:** All core and domain logic now strictly enforced at 95%+ coverage for lines, functions, branches, and statements.
- **Database Mocking:** Integrated `fake-indexeddb` for high-fidelity service testing.

### Project Context Rules

- **Testing Rules:** Vitest + AAA pattern now documented and enforced via thresholds.
- **Critical Zones:** Achieved 100% line coverage on `DatabaseService`, `LoggerService`, and `PersistenceService`.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- Configured `vitest.config.ts` with comprehensive coverage settings.
- Added `test:ci` script to `package.json`.
- Implemented `PersistenceService.test.ts` (100% coverage).
- Expanded `DomainRegistry.test.ts` to cover edge cases and generic methods.
- Expanded `LocalizationService.test.ts` to cover fallbacks and unsubscriptions.
- Expanded `LoggerService.test.ts` to cover all levels and both modes.
- Reached **95.1% branch coverage** across all files.

### Completion Notes List

- Established robust quality guardrails for the project.
- Automated coverage enforcement in CI/CD pipeline (via `test:ci`).
- Delivered comprehensive testing documentation in `docs/TESTING.md`.
- No regressions introduced; all 68 tests passing.

### File List

- vitest.config.ts (modified)
- package.json (modified)
- docs/TESTING.md (new)
- src/core/services/persistence/PersistenceService.test.ts (new)
- src/core/services/database/DatabaseService.test.ts (modified)
- src/core/services/i18n/LocalizationService.test.ts (modified)
- src/core/services/logger/LoggerService.test.ts (modified)
- src/domains/shared/registry/DomainRegistry.test.ts (modified)

### Change Log

- 2026-05-03: Story implementation complete; quality guardrails enforced and verified.

