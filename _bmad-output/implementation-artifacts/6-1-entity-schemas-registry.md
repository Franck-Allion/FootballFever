# Story 6.1: Entity Schemas & Registry Service

Status: review

## Story

As an Architect,
I want to define strict Zod schemas for players and teams and a centralized Registry service,
so that all game systems (React, Phaser, Web Worker) manipulate data through a single, validated source of truth.

## Acceptance Criteria

1. **Strict Data Schemas:** Use Zod to define the following entities in `src/domains/shared/schemas/`:
    - `PlayerSchema`: Includes `id`, `name`, `rarity` (Common to Legendary), `position`, `stats` (Pace, Shooting, Passing, Dribbling, Defense, Physical - 0-100), `level`, `xp`, and `age`.
    - `TeamSchema`: Includes `id`, `name`, `roster` (Array of Player objects or IDs), and `formation`.
2. **Domain Registry Service:** Implement a `DomainRegistry` (Core service) in `src/core/services/registry/` that acts as a Service Locator for active domain data.
3. **Immutability & Validation:** The Registry must validate any data injected using the Zod schemas and return immutable/frozen objects (or copies) to prevent accidental direct mutation.
4. **Worker Readiness:** Schemas must be exportable to the Web Worker. Ensure no DOM or React dependencies in the schema files.
5. **Architecture Compliance:** Respect the `core` -> `domains` restriction. The `DomainRegistry` in `core` should ideally use generic types or be injected with schemas to remain domain-agnostic.

## Tasks / Subtasks

- [x] **Schema Definition** (AC: 1, 4)
  - [x] Create `src/domains/shared/schemas/EntitySchemas.ts`.
  - [x] Define `PlayerRarity` and `PlayerPosition` enums.
  - [x] Implement `PlayerSchema` and `TeamSchema` with Zod.
- [x] **Registry Infrastructure** (AC: 2, 3, 5)
  - [x] Create `src/core/services/registry/DomainRegistry.ts`.
  - [x] Implement the singleton pattern for the registry.
  - [x] Add methods: `registerPlayer(player)`, `getPlayer(id)`, `registerTeam(team)`, etc.
- [x] **Factory Pattern Integration** (AC: 5)
  - [x] Create a basic `EntityFactory.ts` in `src/domains/shared/factories/` to generate valid players for testing.
- [x] **Verification** (AC: 3)
  - [x] Write unit tests to verify that invalid player data (e.g., stat > 100) is rejected by the registry.
  - [x] Verify that retrieved entities from the registry are deep-frozen or copies.

### Review Follow-ups (AI)

- [x] [AI-Review] Make `DomainRegistry` directly extensible with generic `registerSchema(type, schema)`, `register(type, entity)`, and `get(type, id)` APIs while keeping player/team wrappers. (Severity: Medium)

## Dev Notes

- **Naming Convention:** Use `PascalCase.ts` for files as per `project-context.md`.
- **Stat Caps:** Although the GDD says stats are capped at 100, use Zod's `.min(0).max(100)` to enforce this at the schema level.
- **Dependency Rule:** Since `core` cannot import from `domains`, the `DomainRegistry` should probably live in `core` but work with `Record<string, unknown>` or generic `T` that the domains will satisfy. Alternatively, place the *technical registry* in `core` and a *data-specific registry* in `domains` that inherits from it.

### Project Structure Notes

- **src/domains/shared/**: Common domain types and logic used by multiple domains (Match, Career, Loot).
- **src/core/services/registry/**: Core infrastructure for data storage.

### Project Context Rules

Extracted from `project-context.md`:
- **Validation:** Systematic Zod validation for ALL incoming data.
- **Factory Pattern:** Forbidden to use `new` for Players. Use `EntityFactory`.
- **Dependency Matrix:** `core/` -> `domains/` : ❌ FORBIDDEN.

### References

- [Source: _bmad-output/gdd.md#Team and Player Systems]
- [Source: _bmad-output/project-context.md#Code Organization & Naming Rules]
- [Source: _bmad-output/epics.md#Epic 06]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (CLI Agent)

### Debug Log References

- Implemented worker-safe Zod schemas for players, stats, and teams in `EntitySchemas.ts`.
- Added deterministic `EntityFactory` creation helpers backed by schema validation.
- Implemented a singleton `DomainRegistry` with injected schemas, defensive cloning, and deep-freeze semantics.
- Added Vitest coverage for invalid stat rejection, immutable retrieval, and team registration round-trips.
- Validations run: targeted Vitest tests, full Vitest suite, production build, and scoped ESLint on touched registry/domain files.
- Extended registry API to dynamic typed collections and added tests for non-player/team entity registration.
- Post-review validation: full `npx eslint src` and full `npx vitest run` pass.

### Completion Notes List

- Delivered strict `PlayerSchema` and `TeamSchema` definitions with bounded stat validation and no UI/DOM dependencies.
- Kept `DomainRegistry` domain-agnostic by injecting schemas from `domains/shared`, preserving the `core` -> `domains` boundary.
- Ensured registered entities are stored and returned as immutable defensive copies to reduce accidental mutation risk.
- Added a deterministic `EntityFactory` for test data generation without hidden randomness.
- Upgraded registry design to direct extensibility for future entity types without new core service methods.
- Full test suite and repository-wide ESLint now pass.

### File List

- src/domains/shared/schemas/EntitySchemas.ts (new)
- src/domains/shared/factories/EntityFactory.ts (new)
- src/domains/shared/factories/EntityFactory.test.ts (new)
- src/domains/shared/registry/DomainRegistry.test.ts (new)
- src/core/services/registry/DomainRegistry.ts (new/modified after review follow-up)

### Change Log

- 2026-05-03: Implemented entity schemas, registry service, deterministic factory, and verification tests; story moved to review.
- 2026-05-03: Addressed code review findings by making registry API directly extensible and re-validating full lint/test suite.
