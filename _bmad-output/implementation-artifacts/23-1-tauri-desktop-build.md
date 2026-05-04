# Story 23.1: Tauri Desktop Build

Status: in-progress

## Story

As a Publisher,
I want a signed `.exe`/`.app`,
so that I can sell FootballFever through desktop stores.

## Acceptance Criteria

1. The repository has a working Tauri v2 scaffold under `src-tauri/` that wraps the existing Vite/React/Phaser application without changing gameplay code.
2. `package.json` exposes desktop scripts for Tauri development and bundling, and `package-lock.json` is updated consistently.
3. Tauri config points to the existing Vite build output and dev server: `frontendDist` must resolve to `../dist`, and `devUrl` must match the Vite dev port currently configured in `vite/config.dev.mjs`.
4. The desktop build command produces Tauri bundle artifacts on the current platform, or documents the exact missing host prerequisite if the local machine cannot bundle.
5. IndexedDB/Dexie persistence is verified inside the Tauri WebView by launching the desktop app, saving state through the existing `PersistenceService`/`DatabaseService`, closing the app, reopening it, and confirming the state survives.
6. Signing readiness is prepared without committing private material: public/config placeholders may be committed, but private keys, certificates, passwords, and store credentials must remain outside the repo.

## Tasks / Subtasks

- [x] Add Tauri v2 to the existing app (AC: 1, 2)
  - [x] Install the official Tauri v2 CLI/package dependencies for an npm project.
  - [x] Initialize `src-tauri/` with app identity for FootballFever.
  - [x] Keep the current React/Phaser entrypoints unchanged unless Tauri requires a minimal asset/path compatibility fix.
- [x] Configure Vite/Tauri integration (AC: 2, 3)
  - [x] Add `tauri`, `desktop:dev`, and `desktop:build` scripts to `package.json`.
  - [x] Configure Tauri `build.beforeDevCommand`, `build.beforeBuildCommand`, `build.devUrl`, and `build.frontendDist`.
  - [x] Ensure the Vite dev server uses a fixed port compatible with Tauri. Current project port is `8080`; if changed, update both Vite and Tauri together.
- [ ] Validate desktop persistence (AC: 5)
  - [x] Use the existing Dexie-backed `DatabaseService` and `PersistenceService`; do not introduce a separate native save path in this story.
  - [ ] Manually verify persistence in the Tauri WebView with a close/reopen cycle.
  - [x] Add or update an implementation note with the exact verification steps and outcome.
- [x] Prepare signing/distribution readiness (AC: 4, 6)
  - [x] Add safe signing placeholders/config documentation only.
  - [x] Do not commit generated private updater keys, signing certificates, Apple credentials, Windows certificate passwords, or store tokens.
  - [x] Document platform prerequisites if build/signing cannot run on the current host.
- [x] Verification (AC: 1-6)
  - [x] Run `npm run build`.
  - [x] Run `npm run desktop:build` or record the precise missing Rust/platform dependency.
  - [x] Run `npm run test:ci` unless unrelated pre-existing coverage failures block it; report any blocker exactly.

## Dev Notes

### Scope Boundaries

- This story is packaging infrastructure. Do not implement new gameplay, economy, match simulation, roster, or UI features.
- Do not replace the existing Vite config layout. The project already uses `vite/config.dev.mjs` and `vite/config.prod.mjs`; wire Tauri to those scripts through `npm run dev` and `npm run build`.
- Do not create a second persistence layer. Desktop persistence acceptance is specifically about proving the current IndexedDB/Dexie path works in the native WebView.

### Current Project State

- There is no `src-tauri/` directory yet.
- `package.json` currently has `dev`, `build`, `catalog:players`, `test`, and `test:ci` scripts, but no Tauri scripts.
- `npm` is the package manager; `package-lock.json` exists and must be updated if dependencies are added.
- Vite dev config uses port `8080` and `base: './'`.
- Vite production config outputs to the default `dist` directory and already uses `base: './'`, which is appropriate for packaged desktop assets.
- Persistence currently lives in `src/core/services/database/DatabaseService.ts` and `src/core/services/persistence/PersistenceService.ts`.

### Tauri v2 Integration Requirements

- Use official Tauri v2 APIs and CLI conventions.
- Typical npm scripts from official docs include a `tauri` script that delegates to the Tauri CLI, then app-specific scripts can call it.
- Tauri/Vite config must align:
  - `build.beforeDevCommand`: `npm run dev`
  - `build.beforeBuildCommand`: `npm run build`
  - `build.devUrl`: `http://localhost:8080` unless the Vite port is intentionally changed
  - `build.frontendDist`: `../dist`
- Tauri expects a stable dev URL. If the Vite port is unavailable, fail visibly instead of silently moving to another port.
- Add Tauri-specific Vite watch ignores for `src-tauri/**` if needed to avoid frontend rebuild loops.

### Signing Readiness

- Windows signing requires certificate configuration such as certificate thumbprint, digest algorithm, and timestamp URL, but real certificate values must not be committed.
- Tauri updater signing uses generated key material. Store private keys outside the repo and commit only public keys/placeholders if updater config is introduced.
- macOS signing/notarization requires Apple Developer credentials and platform-specific host setup. Document prerequisites rather than faking a signed `.app` locally.
- The acceptance target is "ready for signing and bundling" with safe placeholders if credentials are not available.

### IndexedDB Verification

- Tauri desktop uses a system WebView. Treat WebView storage as browser storage and verify empirically with the app lifecycle.
- Test the existing flow rather than adding Tauri-only save logic:
  1. Start the desktop app.
  2. Trigger state that writes through `PersistenceService`/`DatabaseService`.
  3. Close the desktop window completely.
  4. Reopen the desktop app.
  5. Confirm the state is restored and no corruption recovery notice appears.

### Project Structure Notes

- Add Tauri files under `src-tauri/`.
- Keep web app code under existing folders:
  - `src/core/` for app services, persistence, FSM, command infrastructure.
  - `src/domains/` for pure gameplay/domain logic.
  - `src/presentation/` for React UI.
  - `src/game/` for Phaser scenes and bridge code.
- Follow existing source naming: PascalCase source files, kebab-case folders where new folders are needed.

### Project Context Rules

- Phaser remains singleton guarded through the existing React bridge; do not create extra `Phaser.Game` instances for desktop.
- Match simulation remains isolated in the Web Worker. Do not import React, Phaser, or Tauri APIs into `src/domains/match/worker/`.
- All persistent data must continue to pass through `DatabaseService` and Zod validation.
- No silent fallbacks: if desktop persistence or bundling fails, surface a structured error or implementation note with the exact cause.
- No magic numbers in gameplay code. This story should not add gameplay constants.
- Do not manually edit generated `PlayerCatalog.dX.ts` files.

### Testing Requirements

- Use Vitest for unit/logic checks and keep AAA structure.
- Run `npm run build` after Tauri integration to prove the web bundle still works.
- Run `npm run test:ci` to protect `src/core/**` and `src/domains/**` coverage.
- Tauri bundling may require Rust and platform dependencies. If unavailable, document the exact missing command/toolchain output in the Dev Agent Record instead of claiming success.

### References

- [Source: _bmad-output/epics.md#Epic 23: Packaging Desktop Tauri]
- [Source: _bmad-output/game-architecture.md#Engine & Framework (Commercial Readiness)]
- [Source: _bmad-output/project-context.md#Technical Constitution for AI Agents]
- [Source: package.json#scripts]
- [Source: vite/config.dev.mjs#server]
- [Source: vite/config.prod.mjs#build]
- [Source: src/core/services/database/DatabaseService.ts]
- [Source: src/core/services/persistence/PersistenceService.ts]
- [Source: Tauri docs via Context7, /tauri-apps/tauri-docs, Vite frontend integration and Tauri develop/distribute signing docs]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm install @tauri-apps/api@^2.0.0 @tauri-apps/cli@^2.0.0 --save-dev` completed; dependency placement was then normalized so `@tauri-apps/api` is a runtime dependency and `@tauri-apps/cli` remains a devDependency.
- `npm test -- TauriConfig` passed: `src/core/services/desktop/TauriConfig.test.ts` validates npm scripts and the Tauri/Vite build contract.
- `npm run build` passed with the existing Vite production config.
- Initial `npm run desktop:build` reached the Tauri CLI and failed because Cargo was not installed: `failed to run cargo metadata ... program not found`.
- Rustup was installed through `winget`; active toolchain is `stable-x86_64-pc-windows-msvc` with `rustc 1.95.0` and `cargo 1.95.0`.
- Added `src-tauri/icons/*` and declared bundle icons in `src-tauri/tauri.conf.json` after the first Rust build reported `icons/icon.ico` missing.
- `npm run desktop:build` passed and produced:
  - `src-tauri/target/release/football-fever.exe`
  - `src-tauri/target/release/bundle/msi/FootballFever_0.1.0_x64_en-US.msi`
  - `src-tauri/target/release/bundle/nsis/FootballFever_0.1.0_x64-setup.exe`
- `npm run test:ci` was executed and failed in pre-existing domain registry tests unrelated to the Tauri changes. Failure source: `src/domains/shared/registry/DomainRegistry.test.ts` creates player fixtures missing required schema fields such as `mainPosition`, complete `stats`, `overallRating`, `potential`, and `prestigeValue`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added a Tauri v2 desktop scaffold under `src-tauri/` with FootballFever app identity and Vite integration.
- Added npm desktop scripts and locked Tauri dependencies in `package-lock.json`.
- Pinned Vite dev server behavior for Tauri by enabling `strictPort` on port `8080` and ignoring `src-tauri/**` watch events.
- Added desktop packaging documentation covering host prerequisites, persistence verification steps, and signing material rules.
- Added a Vitest guardrail for the Tauri config and script contract.
- Desktop bundling is now verified locally. WebView persistence still requires an interactive close/reopen check in the desktop app before this story can move to review.

### File List

- `.gitignore`
- `docs/TAURI_DESKTOP.md`
- `package-lock.json`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/icons/128x128.png`
- `src-tauri/icons/128x128@2x.png`
- `src-tauri/icons/32x32.png`
- `src-tauri/icons/Square107x107Logo.png`
- `src-tauri/icons/Square142x142Logo.png`
- `src-tauri/icons/Square150x150Logo.png`
- `src-tauri/icons/Square284x284Logo.png`
- `src-tauri/icons/Square30x30Logo.png`
- `src-tauri/icons/Square310x310Logo.png`
- `src-tauri/icons/Square44x44Logo.png`
- `src-tauri/icons/Square71x71Logo.png`
- `src-tauri/icons/Square89x89Logo.png`
- `src-tauri/icons/StoreLogo.png`
- `src-tauri/icons/icon.ico`
- `src-tauri/icons/icon.png`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `src/core/services/desktop/TauriConfig.test.ts`
- `vite/config.dev.mjs`

### Change Log

- 2026-05-04: Added Tauri v2 desktop scaffold, npm scripts, Vite dev-server alignment, signing/persistence docs, and config guardrail test. Installed Rustup and verified Windows desktop bundles. Story remains `in-progress` pending manual Tauri WebView persistence verification.
