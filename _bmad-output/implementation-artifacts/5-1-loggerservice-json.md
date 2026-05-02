# Story 5.1: LoggerService JSON

Status: ready-for-dev

## Story

As a Dev,
I want all logs in structured JSON,
so that I can parse errors easily and maintain observability across the main thread and Web Workers.

## Acceptance Criteria

1. **Structured Format:** Every log message must be a JSON-serializable object containing:
    - `timestamp` (ISO-8601)
    - `level` (`DEBUG`, `INFO`, `WARN`, `ERROR`)
    - `source_domain` (e.g., `CORE`, `MATCH`, `UI`, `PERSISTENCE`)
    - `message` (string)
    - `data` (optional object for context/payload)
2. **Centralized Service:** A singleton `LoggerService` in `src/core/services/` must be the unique entry point for logging.
3. **Console Integration:** The service must output the formatted JSON to the browser console (and optionally a local file/buffer for future persistent logging).
4. **Domain-Awareness:** The service should allow setting a default domain per logger instance or require it in every call.
5. **Architectural Isolation:** The service must be usable in both the main thread (React/Phaser) and Web Workers (Match Engine) without modifications.

## Tasks / Subtasks

- [ ] **Infrastructure Setup** (AC: 2, 5)
  - [ ] Create `src/core/services/logger/LoggerService.ts`.
  - [ ] Define the `LogLevel` and `LogDomain` types/enums.
- [ ] **Core Logic Implementation** (AC: 1, 3, 4)
  - [ ] Implement the `LoggerService` singleton.
  - [ ] Implement methods: `debug()`, `info()`, `warn()`, `error()`.
  - [ ] Implement the JSON formatting logic with ISO timestamp generation.
- [ ] **Global Integration** (AC: 3)
  - [ ] Replace any residual `console.log` calls with `LoggerService`.
- [ ] **Verification** (AC: 1, 2)
  - [ ] Write unit tests in Vitest to verify JSON structure and timestamp correctness.
  - [ ] Verify that logs are correctly filtered or formatted in the console.

## Dev Notes

- **Architecture Rule:** Every log must include `source_domain`. This is critical for debugging the hybrid React/Phaser/Worker architecture.
- **Worker Support:** Ensure the service doesn't use DOM-specific APIs (like `window`) so it works inside the Match Engine worker.
- **Persistence Readiness:** Structure the service so that a `LogBuffer` or a call to a future `PersistenceService` can be easily added to save logs to IndexedDB.

### Project Structure Notes

- **src/core/services/logger/**: Location for the logger logic and types.

### Project Context Rules

Extracted from `project-context.md`:
- **Logging:** JSON structuré obligatoire (`ts`, `level`, `src`, `msg`).
- **Naming:** Files `PascalCase.ts`, folders `kebab-case`.

### References

- [Source: _bmad-output/game-architecture.md#Cross-cutting Concerns]
- [Source: _bmad-output/project-context.md#Technical Constitution]
- [Source: _bmad-output/epics.md#Epic 05]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

### Completion Notes List

### File List
