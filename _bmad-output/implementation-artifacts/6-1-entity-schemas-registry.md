# Story 6.1: Entity Schemas & Registry Service

Status: ready-for-dev

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

- [ ] **Schema Definition** (AC: 1, 4)
  - [ ] Create `src/domains/shared/schemas/EntitySchemas.ts`.
  - [ ] Define `PlayerRarity` and `PlayerPosition` enums.
  - [ ] Implement `PlayerSchema` and `TeamSchema` with Zod.
- [ ] **Registry Infrastructure** (AC: 2, 3, 5)
  - [ ] Create `src/core/services/registry/DomainRegistry.ts`.
  - [ ] Implement the singleton pattern for the registry.
  - [ ] Add methods: `registerPlayer(player)`, `getPlayer(id)`, `registerTeam(team)`, etc.
- [ ] **Factory Pattern Integration** (AC: 5)
  - [ ] Create a basic `EntityFactory.ts` in `src/domains/shared/factories/` to generate valid players for testing.
- [ ] **Verification** (AC: 3)
  - [ ] Write unit tests to verify that invalid player data (e.g., stat > 100) is rejected by the registry.
  - [ ] Verify that retrieved entities from the registry are deep-frozen or copies.

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

### Completion Notes List

### File List
