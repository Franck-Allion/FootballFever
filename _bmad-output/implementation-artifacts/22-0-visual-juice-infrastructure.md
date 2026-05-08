# Story 22.0: Visual Juice Infrastructure (Phaser FX Layer)

Status: ready-for-dev

## Story

As an Architect,
I want to transform the hidden Phaser instance into a transparent high-performance FX layer,
so that I can trigger rich animations and particle effects (explosions, panels) over the React UI.

## Acceptance Criteria

1. **Transparent Canvas**: Update Phaser configuration to use `transparent: true` and ensure the background does not block the React UI.
2. **Global Overlay**: Update `App.tsx` and CSS to position the Phaser canvas in absolute full-screen over the entire application (`z-index` higher than UI but lower than Modals/Debug Console).
3. **Communication Bridge**: Establish a bi-directional `EventBus` flow allowing React components to trigger Phaser animations (e.g., `EventBus.emit('play-fx', { type: 'pixel-explosion', x, y })`).
4. **Scene Cleanup**: Remove demo boilerplate scenes ("Make something fun!") and create a dedicated `FXScene.ts` focused on rendering overlays.
5. **Performance Optimization**: Ensure the Phaser rendering loop can be paused/resumed to save resources when no effects are active.
6. **Input Passthrough**: Ensure that the Phaser canvas does not intercept mouse/touch events intended for the React UI (`pointer-events: none` on the container, unless an active FX requires interaction).

## Tasks / Subtasks

- [ ] Phaser Re-configuration
  - [ ] Modify `src/game/main.ts` for transparency and correct parent scaling.
  - [ ] Create `src/game/scenes/FXScene.ts` as the primary overlay scene.
- [ ] UI Integration
  - [ ] Update `App.tsx` to remove `<div className="hidden">` and apply full-screen overlay styles.
  - [ ] Ensure the Phaser canvas resizes correctly with the window/app dimensions.
- [ ] Boilerplate Removal
  - [ ] Delete `Boot.ts`, `MainMenu.ts` (boilerplate versions), and `GameOver.ts` if not relevant to the new FX-first architecture.
- [ ] Event System
  - [ ] Define shared event constants for FX types.
  - [ ] Implement a helper hook `useFX()` to easily trigger effects from any React component.

## Dev Notes

- **Game Feel:** This is the foundation for "Juice". The goal is to make Phaser a silent but powerful visual assistant.
- **Styling:** Use Tailwind classes like `fixed inset-0 pointer-events-none` for the game container.

### Project Context Rules

- **SOLID:** UI components should not know *how* Phaser renders, only *what* effect to trigger.
- **Clean Code:** Remove all remaining Phaser default assets and text.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes List
(To be filled during implementation)

### File List
(To be filled during implementation)
