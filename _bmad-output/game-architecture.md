---
title: 'Game Architecture'
project: 'FootballFever'
date: '2026-05-02T15:20:00.000Z'
author: 'Fal'
version: '1.0'
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: 'complete'
engine: 'Phaser 3.90'
platform: 'Mobile Web / PC (Tauri)'
---

# Game Architecture

## Document Status

This architecture document is complete and serves as the technical source of truth for all implementation agents.

**Steps Completed:** 9 of 9 (Complete)

---

## Executive Summary

FootballFever is a Sports/Roguelite hybrid built on a **Phaser 3.90 + React 19** stack, optimized for Mobile Web and packaged via **Tauri 2.0**.

**Core Pillars:**
- **Performance :** Simulation x15 isolée dans un **Web Worker** dédié (INP ≤ 200ms).
- **Hybrid UI :** Rendu bi-couche (Phaser pour le HUD rapide, React pour la data complexe).
- **Commercial Robustness :** Persistance **Dexie.js** versionnée, obfuscation de l'algorithme, et pipeline d'assets IA (Nano Banana) optimisé.
- **Audio Intelligence :** Système hybride (Streaming pour les ambiances, RAM pour les SFX réactifs).

---

## Project Context

### Game Overview
**FootballFever** - Un hybride Sports/Roguelite de gestion où le joueur doit sauver l'héritage de son club face à des algorithmes de données froids.

### Core Systems Technical Analysis
1. **Simulation Match Engine :** Logique statistique isolée tournant à x15 dans un Web Worker.
2. **Reactive UI Bridge :** Tunnel haute fréquence (postMessage + Zustand) pour synchroniser le moteur et l'interface.
3. **Heritage Synergies Calculator :** Calculateur de bonus de set injecté dans le moteur de probabilités.
4. **Persistent Run Manager :** Gestionnaire de cycle de vie sur 15 saisons avec migrations automatisées.

---

## Engine & Framework (Commercial Readiness)

### Core Stack
- **Engine :** **Phaser 3.90 (Tsugumi)** - Licence MIT.
- **UI Framework :** **React 19** + **TailwindCSS** + **Zustand** (Store d'état).
- **Wrapper :** **Tauri 2.0** (Rust Backend) - Empreinte mémoire < 80MB (Idle).

### UI Strategy (Hybrid Architecture)
- **High-Frequency HUD (Phaser) :** Chronomètre, Score, Barres de fatigue.
- **Heavy/Data UI (React) :** Menus de gestion, Inventaire, Draft, Archives.
- **Narrative Log (React) :** Flux de commentaires virtualisé (throttling max 4 updates/sec).

### Asset Pipeline (AI-Driven)
- **Sources :** **Nano Banana** & **ChatGPT (DALL-E 3)**.
- **Optimization :** Pipeline de conversion automatique vers **WebP/AVIF**.
- **Post-Processing :** Shaders Phaser pour unifier la colorimétrie des sources IA.

### AI & Development Environment (Mandatory)
- **Phaser MCP Server :** Inspection obligatoire pour les agents IA.
- **Upstash Context7 :** Documentation temps réel obligatoire.

---

## Architectural Decisions

### State Management (Zustand Strategy)
- **Separation :** Store Global (Meta) vs Store Match (Éphémère).
- **Access :** Bridge TypeScript pour l'accès bi-directionnel entre React et Phaser.

### Data Persistence (Commercial Grade)
- **DatabaseService :** Singleton unique isolant IndexedDB.
- **Versioning :** Migration de schéma Dexie obligatoire à chaque changement de structure de loot.

### Simulation Engine (Web Worker)
- **Isolation :** Code pur TS mathématique. Interdiction d'accès au DOM.
- **Performance :** Garantit 60 FPS constants malgré la simulation x15.

### Player Catalog System (Static Data)
- **Structure :** Divisée par divisions (`d1` à `d4`) pour limiter l'empreinte mémoire lors du chargement initial.
- **Organization :**
    - `PlayerCatalog.ts` : Point d'entrée consolidé (exporte `PLAYER_CATALOG`).
    - `PlayerCatalog.dX.ts` : Données brutes par division.
    - `PlayerCatalog.types.ts` : Définitions d'interfaces (`CatalogPlayer`).
- **Generation :** Les fichiers sont générés via `scripts/generate-player-catalog.mjs`. Toute modification manuelle est proscrite ; passer par le générateur ou le pool de noms.
- **Integration :** Utilisé comme source de vérité pour le recrutement, la draft et l'initialisation des adversaires.

---

## Cross-cutting Concerns (The Technical Constitution)

1. **Logging :** JSON structuré obligatoire (`ts`, `level`, `src`, `msg`).
2. **Configuration :** Fichiers JSON modulaires (`GameConfig`, `MatchConfig`). Pas de "magic numbers".
3. **FSM :** Transitions de jeu gérées par une Finite State Machine explicite.
4. **Commands :** Toute mutation d'état majeur doit passer par le `CommandBus`.
5. **Feature Flags :** Lifecycle strict (max 2 sprints) via `Features.ts`.

---

## Project Structure (src/)

```text
src/
├── core/               # Constitution (Database, Store, Commands, FSM)
├── domains/            # Logique métier pure
│   ├── match/          # Match Engine (Sim x15)
│   │   ├── worker/     # Isolation Web Worker
│   │   └── logic/      # AI, xG Stats
│   ├── loot/           # Synergies
│   └── career/         # Seasonal cycles
├── presentation/       # Layer visuel
│   ├── phaser/         # Scènes & HUD Performance
│   └── ui/             # React Components (Tailwind/CVA)
└── utils/              # Math & IA helpers
```

---

## Implementation Patterns

### Novel Patterns
- **Papi Advice Bridge :** Système de remontée des conseils tactiques réactifs.
- **Hybrid Audio Stratified :** Streaming pour les ambiances de division, RAM pour les SFX tactiques.

### Coding Standards
- **Entity Creation :** Factory Pattern strict (`EntityFactory`). Constructeur `new` privé.
- **UI Architecture :** **CVA (Class Variance Authority)** pour les composants Tailwind atomiques.
- **Injection :** Service Locator centralisé pour les services Core.

---

## Development Environment Setup

### Prerequisites
- Node.js v20+ / npm v10+
- Rust toolchain (Tauri 2.0)

### Initialization
```bash
npm create phaser@latest (select React/TS)
npm install zustand dexie zod tailwindcss class-variance-authority tailwind-merge clsx
npx tauri init
```

---

## Architecture Validation
- **GDD Coverage :** 100%
- **Patterns Defined :** 9
- **Technical Risks Addressed :** Memory, CPU, IP Protection.
- **Date :** 2026-05-02
