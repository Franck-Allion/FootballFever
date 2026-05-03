# Story 10.2: Management Hub AAA Redesign

Status: done

## Story

As a Manager,
I want a deep, tactical command center with high visual fidelity,
so that I can manage my route to glory and optimize my RPG synergies.

## Acceptance Criteria

1. Implement Hub UI following the "Obsidian Athletics" AAA design spec.
2. Include the horizontal scrolling "Route to Glory" timeline with match/event nodes.
3. Display Team Composites (Shooting, Control, Defense) with segmented tech-bars.
4. Show active Roguelite synergies/blessings from items.
5. High-fidelity Squad Vitals (Stamina segmented bar and pulsing Morale).
6. Primary "SIMULATE MATCH" button with advanced hover/active states and neon glow.
7. Mobile-first responsive layout with floating bottom navigation.

## Implementation Details

- **Visual Fidelity:** Deep blacks (#050505), high-tech glassmorphism (12px blur), and intense neon green (#39FF14).
- **Typography:** Space Grotesk for stats and headers; Inter for body text.
- **Components:** Completely overhauled `src/presentation/ui/hub/HubScreen.tsx`.
- **Stores:** Updated `useSquadStore.ts` to support timeline nodes, composite stats, and active synergies.

## Verification

- **Build:** `npm run build` completed successfully.
- **Responsiveness:** Timeline supports horizontal touch/mouse scrolling; Bento grid adapts to desktop.
- **FSM:** "Simulate Match" successfully triggers simulation flow.

## Dev Agent Record

### Agent Model Used
Gemini 2.0 Flash

### Completion Notes
Extracted visual tokens from Stitch HTML to ensure style accuracy. Integrated deep GDD mechanics (Timeline, Synergies) into the UI to move beyond a simple dashboard to a AAA-quality tactical center.
