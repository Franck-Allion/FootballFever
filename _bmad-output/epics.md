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

## Detailed Epics & Stories (Phase 1 & 2 Focus)

### Epic 00: Fondations Techniques
*Goal: Socle Vite/React/Tauri stable et typé.*

#### Story 0.1: Initialisation & Strict TS
- **As a** Lead Dev, **I want** a project Vite/React/TS avec strict mode, **So that** code is robust.
- **AC:** TS config `strict: true`, no `any`.

#### Story 0.2: Dossiers & Aliases
- **As a** Dev, **I want** `@core`, `@domains`, `@ui` aliases, **So that** imports are clean.
- **AC:** Build works with aliases.

---

### Epic 03: Flow Applicatif (FSM)
*Goal: Gérer les transitions d'état globales (BOOT -> HUB -> MATCH).*

#### Story 3.1: Finite State Machine Controller
- **As an** Architect, **I want** a centralized `FlowController`, **So that** screen transitions are deterministic.
- **AC:** Transition `HUB` to `MATCH` only possible if lineup is valid.

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

#### Story 11.1: Virtualized Live Feed
- **As a** Player, **I want** to read match comments in a fast list, **So that** I can follow x15 speed.
- **AC:** `react-window` used for lists > 30 items. Performance stable.

---

### Epic 23: Packaging Desktop Tauri
*Goal: Sortie PC.*

#### Story 23.1: Tauri Desktop Build
- **As a** Publisher, **I want** a signed `.exe`/`.app`, **So that** I can sell on Desktop stores.
- **AC:** Tauri packaging script works. IndexedDB persistence works in native wrapper.

---

_Detailed story breakdown for Epics 12-24 to be generated during implementation sprints._
