# Tauri Desktop Packaging

FootballFever uses Tauri v2 as the desktop wrapper around the existing Vite, React, and Phaser application.

## Commands

```bash
npm run desktop:dev
npm run desktop:build
```

`src-tauri/tauri.conf.json` is wired to the existing web scripts:

- `beforeDevCommand`: `npm run dev`
- `beforeBuildCommand`: `npm run build`
- `devUrl`: `http://localhost:8080`
- `frontendDist`: `../dist`

The Vite dev server is intentionally pinned to port `8080` with `strictPort: true` so Tauri and Vite fail visibly if the configured desktop dev URL is unavailable.

## Host Prerequisites

Desktop bundling requires the Rust toolchain:

```bash
rustc --version
cargo --version
```

If either command is unavailable, install Rust before running `npm run desktop:build`.

## Persistence Verification

The desktop app must continue to use the existing IndexedDB/Dexie persistence path through `DatabaseService` and `PersistenceService`.

Manual verification steps:

1. Run `npm run desktop:dev`.
2. Change state that writes through the existing persistence flow.
3. Close the desktop window completely.
4. Run `npm run desktop:dev` again.
5. Confirm the state is restored and no corruption recovery notice appears.

Do not add a Tauri-only save system for this story.

## Signing Readiness

Signing credentials and private updater keys must stay outside the repository.

Safe to commit:

- Public documentation.
- Placeholder instructions.
- Non-secret bundle metadata.

Never commit:

- Windows signing certificates or certificate passwords.
- Apple Developer credentials.
- Private updater keys.
- Store tokens or release credentials.

When real credentials are available, configure signing through environment variables, CI secrets, or local machine certificate stores.
