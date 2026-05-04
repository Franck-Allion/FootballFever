---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['gdd.md', 'game-architecture.md', 'narrative-design.md', 'algoritm.md', 'project-context.md']
project_name: 'FootballFever'
last_overhaul: '2026-05-02'
---

# FootballFever - Master Backlog (Industrial MVP)

## Overview
Ce document est le carnet de produit définitif de FootballFever. Il est structuré pour une implémentation assistée par IA, avec une séparation stricte entre le cœur mécanique (MVP Texte) et l'expérience visuelle (Premium).

## Requirements Inventory

### Functional Requirements (FR)
- FR1: Simulation déterministe x15 isolée (Web Worker).
- FR2: Événements interactifs "Coach Choice".
- FR3: IA adverse "Génius" réactive.
- FR4: Carrière sur 15 saisons.
- FR5: Loot Héritage et synergies.
- FR6: Mercato Draft Roguelite.
- FR7: Économie Prestige.
- FR8: Gestion Santé/Moral/Fatigue.
- FR9: Localisation FR/EN/ES/DE.

### Non-Functional Requirements (NFR)
- NFR1: Performance mobile (LCP ≤ 2.5s, INP ≤ 200ms).
- NFR2: Mémoire < 250 Mo.
- NFR3: Stabilité (Zero crash 60 min).
- NFR4: Intégrité (Zod + Migrations).
- NFR5: Protection PI (Obfuscation).

---

## Roadmap & Priorities

### Phase 1: Socle Constitutionnel (P0 - MVP)
- **Epic 00: Fondations Techniques**
- **Epic 01: Localisation Immédiate**
- **Epic 02: Sauvegarde Immédiate**
- **Epic 03: Flow Applicatif (FSM)**
- **Epic 04: Qualité & CI (Vitest/Garde-fous)**
- **Epic 05: Observabilité & Debug (Console/Logger)**

### Phase 2: Moteur de simulation (P0 - MVP)
- **Epic 06: Données de Domaine (Registry)**
- **Epic 07: Simulation x15 (Physique/xG)**
- **Epic 08: Batch Simulator & Invariants**

### Phase 3: Boucle MVP Jouable Texte (P0 - MVP)
- **Epic 09: Boucle de Gameplay MVP**
- **Epic 10: Hub de Gestion V1**
- **Epic 11: Match Texte & Résultat**

### Phase 4: Contenu & Réalisme (P1 - MVP)
- **Epic 12: Commentaires Avancés (Random Buckets)**
- **Epic 13: Gestion d'Effectif (11 + Banc)**
- **Epic 14: Gestion Humaine (Fatigue/Blessures)**
- **Epic 15: Événements Coach Choice**

### Phase 5: Cœur Roguelite (P1 - MVP)
- **Epic 16: Économie Prestige & Boutique**
- **Epic 17: Équipement & Synergies**
- **Epic 18: Mercato Draft**
- **Epic 19: Progression XP & Level Up**
- **Epic 20: Saison & Championnat Simplifié**

### Phase 6: Premium & Distribution (P2 - Post-MVP)
- **Epic 21: Vue Premium Phaser (Pitch/Animations)**
- **Epic 22: Polish Mobile & Visual Juice**
- **Epic 23: Packaging Desktop Tauri**
- **Epic 24: Contenu Endgame (Europe/Héritage)**

---

## Detailed Epics & Stories

### Epic 00: Fondations Techniques
*Goal: Socle Vite/React/Tauri stable et typé.*

#### Story 0.1: Initialisation & Strict TS
- **As a** Lead Dev, **I want** a project Vite/React/TS avec strict mode, **So that** code is robust.
- **AC:** TS config `strict: true`, no `any`.

#### Story 0.2: Dossiers & Aliases
- **As a** Dev, **I want** `@core`, `@domains`, `@ui` aliases, **So that** imports are clean.
- **AC:** Build works with aliases.

---

### Epic 01: Localisation Immédiate
*Goal: Support multilingue dès le départ.*

#### Story 1.1: Localization Infrastructure
- **As a** Global Player, **I want** the UI in my language (FR/EN/ES/DE), **So that** I understand the gameplay.
- **AC:** `LocalizationService` setup, no hardcoded strings in `App.tsx`, language switching works.

---

### Epic 02: Sauvegarde Immédiate
*Goal: Persistance des données via IndexedDB.*

#### Story 2.1: Persistence with Dexie.js & Zod
- **As a** Player, **I want** my progress to be saved automatically, **So that** I can resume my career.
- **AC:** `DatabaseService` implemented with Dexie, Zod validation on load, data survives refresh.

---

### Epic 03: Flow Applicatif (FSM)
*Goal: Gérer les transitions d'état globales (BOOT -> HUB -> MATCH).*

#### Story 3.1: Finite State Machine Controller
- **As an** Architect, **I want** a centralized `FlowController`, **So that** screen transitions are deterministic.
- **AC:** Transition `HUB` to `MATCH` only possible if lineup is valid.

---

### Epic 04: Qualité & CI (Vitest/Garde-fous)
*Goal: Garantir la stabilité et la couverture de test.*

#### Story 4.1: Test Coverage & CI Guardrails
- **As a** Maintainer, **I want** 95%+ test coverage on core logic, **So that** regressions are caught early.
- **AC:** Vitest configured with coverage thresholds, `npm test` fails if coverage < 95% on `src/domains`.

---

### Epic 05: Observabilité & Debug
*Goal: Outils pour voir ce que l'IA code.*

#### Story 5.1: LoggerService JSON
- **As a** Dev, **I want** all logs in structured JSON, **So that** I can parse errors easily.
- **AC:** Logs include `timestamp`, `level`, and `source_domain`.

#### Story 5.2: In-Game Debug Console
- **As a** Balancer, **I want** a console (Triple-tap) to inject Prestige/Loot, **So that** I can test any state.
- **AC:** Command `/add_prestige 5000` works immediately.

---

### Epic 07: Simulation x15 (Web Worker)
*Goal: Le moteur de match isolé.*

#### Story 7.1: Worker Bootstrap & Heartbeat
- **As an** Architect, **I want** the engine in a pure TS Web Worker, **So that** it's off-main-thread.
- **AC:** Main thread receives a heartbeat from the worker every 1s.

#### Story 7.2: Zone-based Physics (Grid 20)
- **As an** Engine, **I want** to resolve ball movement across 20 zones, **So that** progression is logical.
- **AC:** Ball position persists and updates per tick.

#### Story 7.3: xG & Deterministic Resolution
- **As a** Balancer, **I want** shots resolved via xG and SeededRandom, **So that** results are repeatable.
- **AC:** Same seed + stats = same match score.

---

### Epic 11: Match Texte & Résultat (MVP)
*Goal: Suivre le match sans Phaser.*

#### Story 11.1: Virtualized Live Feed [COMPLETED]
- **As a** Player, **I want** to read match comments in a fast list, **So that** I can follow x15 speed.
- **AC:** `react-window` used for lists > 30 items. Performance stable.

#### Story 11.2: Detailed Scoreboard & Stoppage Time
- **As a** Player, **I want** to see scorers' names and cards in the scoreboard and experience stoppage time, **So that** the simulation feels like a real football broadcast.
- **AC:** Scoreboard displays a list of scorers and player names for yellow/red cards. Engine calculates and displays +1', +2', etc. at the end of each half.

#### Story 11.3: Match Simulation Visual Juice
- **As a** Player, **I want** high-impact visual feedback when important events occur (Goal, Red Card, Injury), **So that** I feel the intensity even in a text simulation.
- **AC:** Implementation of full-screen flash effects, camera shake (UI shake), and large animated overlays for GOAL and RED CARD events.

#### Story 11.4: Simulation Speed Control & Skip
- **As a** Busy Manager, **I want** to control the simulation speed (x15, x30, x60) or see the result instantly, **So that** I can progress through the season at my own pace.
- **AC:** UI buttons for x15/x30/x60 speeds. "Skip to Result" button that executes the remaining simulation in a single batch (BatchSimulator) and displays the final score instantly.

---

### Epic 12: Commentaires Avancés (Random Buckets)
*Goal: Richesse narrative et diversité des logs.*

#### Story 12.1: Advanced Commentary Engine
- **As a** Player, **I want** more varied and contextual comments (injuries, VAR, crowd), **So that** the match isn't repetitive.
- **AC:** System supports random buckets and player-specific placeholders ({player}, {team}, etc.).

#### Story 12.2: Full Commentary Catalog Implementation
- **As a** Player, **I want** every match action to generate specific and varied commentary, **So that** I can follow the match precisely as described in the algorithm.
- **AC:** Implementation of the complete catalog from `algorithm.md` (Passes, Duels, Pressing, Corners, Injuries, etc.) with localized variations (300+ phrases).

---

### Epic 13: Gestion d'Effectif (11 + Banc)
*Goal: Gestion des joueurs et compositions.*

#### Story 13.1: Roster Data & Store Integration
- **As a** Manager, **I want** a real squad of 20-25 players with distinct stats and rarities, **So that** my tactical choices matter.
- **AC:** Store initialized with dynamic roster, replacement of hardcoded Hub lists with real player data.

#### Story 13.2: Dynamic Team Rating Calculator
- **As a** Tactician, **I want** my team's overall rating to update based on my current lineup, **So that** I can measure the impact of my changes.
- **AC:** Formula-based overall calculation (weighted stats per position) updating in real-time.

#### Story 13.3: Drag & Drop Lineup Editor
- **As a** Coach, **I want** to easily swap players between the pitch and the bench, **So that** I can optimize my tactics.
- **AC:** Implementation of a Drag & Drop interface in the Roster screen, with automatic validation of the formation.

---

### Epic 14: Gestion Humaine (Fatigue/Blessures)
*Goal: Impact physique et moral sur le long terme.*

#### Story 14.1: Dynamic Fatigue & Morale System
- **As a** Coach, **I want** players' stamina and morale to evolve during and between matches, **So that** I have to manage my squad's rotation.
- **AC:** In-match fatigue drain and post-match recovery/morale adjustment based on results.

---

### Epic 15: Événements Coach Choice
*Goal: Interactivité et décisions tactiques critiques.*

#### Story 15.1: Interactive Match Breakpoints
- **As a** Manager, **I want** the match simulation to pause during critical moments (Penalty, Red Card, Late Game), **So that** I can make high-stakes tactical decisions.
- **AC:** Implementation of the 10 critical choice types from `algorithm.md` (Penalty taker, Free kick routine, Injury management, etc.) with immediate impact on the simulation engine.

---

### Epic 20: Saison & Championnat Simplifié
*Goal: Structure de compétition et enjeux de classement.*

#### Story 20.1: League Matchday Simulation & Suspense Feed
- **As a** Manager, **I want** to see the results of other teams in my division after my match, **So that** I can see how my rivals performed.
- **AC:** Simulation of all other matches in the matchday (BatchSimulator). Progressive display of results with a "suspense" animation (slow reveal).

#### Story 20.2: Dynamic Standings Update
- **As a** Competitor, **I want** the league table to be updated instantly after the matchday results, **So that** I can see my current position.
- **AC:** Points and goal difference calculation. UI display of the full league table with promotion/relegation zone highlights.

---

### Epic 23: Packaging Desktop Tauri
*Goal: Sortie PC.*

#### Story 23.1: Tauri Desktop Build
- **As a** Publisher, **I want** a signed `.exe`/`.app`, **So that** I can sell on Desktop stores.
- **AC:** Tauri packaging script works. IndexedDB persistence works in native wrapper.

---

_Detailed story breakdown for Epics 12-24 to be generated during implementation sprints._
