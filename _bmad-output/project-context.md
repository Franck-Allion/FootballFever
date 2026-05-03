---
project_name: 'FootballFever'
user_name: 'Fal'
date: '2026-05-02T15:50:00.000Z'
sections_completed: ['technology_stack', 'core_patterns']
existing_patterns_found: 8
---

# Project Context: FootballFever

## 🎯 Technical Constitution for AI Agents

This document contains the absolute rules and patterns that **must** be followed when implementing code for FootballFever. Any deviation from these standards is considered a system failure.

---

## 🛠 Technology Stack & Versions

- **Game Engine :** **Phaser v3.90.0** (Tsugumi).
- **Frontend :** **React v19.0.0** (Concurrent Rendering).
- **Testing :** **Vitest v2.0+** (Mandatory for all unit/logic tests).
- **State :** **Zustand v5.0.0** (JSON persistence middleware).
- **Database :** **Dexie.js v4.0.0** (IndexedDB v3 support).
- **Styles :** **TailwindCSS v3.4+** & **CVA** (Class Variance Authority).
- **Backend/Wrapper :** **Tauri v2.0.0** (Rust Backend).
- **Language :** **TypeScript v5.4+** (Strict Mode = true).
- **Validation :** **Zod v3.22+** (Schema-driven types mandatory).

---

## 🏗 Core Architectural Patterns

### 1. Match Engine Isolation (Web Worker)
- **Rule:** All match simulation logic (x15 speed) **must** reside in a dedicated Web Worker.
- **Constraint:** No access to the DOM or Phaser API within the worker.
- **Communication:** Bi-directional messaging via `postMessage` with output throttling.
- **Boot Pattern :** Initialiser le Worker via un hook racine unique pour éviter les doubles instances.

### 2. Phaser Singleton Guard
- **Rule :** Interdiction de créer plusieurs instances de `Phaser.Game`.
- **Implementation :** Utiliser un pattern `isInitialized` dans le bridge React pour gérer le cycle de vie du moteur proprement sous React 19 Strict Mode.

### 3. State Mutation (Command Pattern)
- **Rule:** Never modify the Zustand store directly from business logic.
- **Implementation:** Dispatch a Command via the `CommandBus`.
- **Goal:** Traceability, undo/redo support, and easier debugging.

### 4. Game Flow (FSM)
- **Rule:** Screen transitions and game modes are managed by a central **Finite State Machine**.
- **States:** BOOT, HUB, DRAFT, MATCH_PREP, MATCH_SIM, MATCH_RESULT, REWARD.

### 5. Persistence & Zod
- **Rule:** Toutes les opérations DB passent par le `DatabaseService`.
- **Schema-First :** Utiliser `z.infer<typeof schema>` pour générer les types TypeScript à partir de Zod, assurant une synchronisation parfaite entre la save et le code.

---

## 📜 Critical Implementation Rules

### Engine-Specific Rules (Phaser / React)

- **Bridge React/Phaser :** Utilisation obligatoire du composant `PhaserGame` du template officiel.
- **Event Bus :** Toutes les communications asynchrones passent par le singleton `EventBus.ts`.
- **Assets Loading :** Utilisation du `LoaderPlugin` de Phaser uniquement dans la scène `Preloader`. Interdiction de charger des images via des `import` standards dans les scènes de match.
- **UI Hybrid Strategy :** 
    - Phaser : HUD Haute-Fréquence (Score, Chrono).
    - React : Données complexes et Logs (Throttled).

### Performance Rules (Mobile First)

- **Target INP :** ≤ 200ms sur tous les écrans (Interaction Next Paint).
- **Simulation Throttling :** Le Web Worker doit "bufferiser" les messages et les envoyer au thread principal max 4 fois par seconde réelle, même en vitesse x15.
- **Memory Culling :** Les textures de portraits des divisions précédentes doivent être explicitement détruites via `this.textures.remove()` lors du passage à une division supérieure.
- **Virtualized Lists :** Toute liste de plus de 30 éléments (Commentaires de match, Inventaire, Historique) **doit** utiliser une solution de virtualisation (ex: `react-window`).
- **Battery Saver Mode :** Imposer un flag global pour réduire le FPS de Phaser à 30 et désactiver les particules lourdes si l'utilisateur l'active.
- **Asset Budget :** Interdiction de charger plus de 5 Mo d'assets supplémentaires lors de l'entrée en match.

### Code Organization & Naming Rules

- **Dependency Matrix (Strict) :**
    - `presentation/` -> `core/` : ✅ Autorisé (Commands/Events).
    - `presentation/` -> `domains/` : ⚠️ **Read-Only** (Types/Selectors uniquement).
    - `domains/X` -> `domains/Y` : ❌ **INTERDIT** (Passer par l'EventBus).
    - `domains/` -> `core/` : ✅ Autorisé (Services/FSM).
    - `core/` -> `domains/` : ❌ **INTERDIT** (Le socle doit être agnostique).
- **Match Worker Isolation :** Interdiction physique d'importer toute librairie UI (React/Phaser) dans le dossier `match/worker/`.
- **Factory Pattern :** Interdiction d'instancier un joueur ou un item avec `new`. Utiliser `EntityFactory`.
- **Command Pattern :** Toute mutation d'état (XP, Loot, Prestige) doit être dispatchée via le `CommandBus`.
- **Naming :** 
    - Fichiers source : `PascalCase.ts`.
    - Dossiers : `kebab-case`.
    - Assets : `prefix_division_name.webp`.

### Testing Rules (Vitest Mandatory)

- **Critical Zones (95-100% Coverage) :** `domains/match/`, `domains/loot/`, `core/services/Database/`. Blocage de build impératif si ce seuil n'est pas atteint.
- **Pattern AAA (Arrange-Act-Assert) :** Obligatoire pour tous les tests unitaires afin de garantir la lisibilité humaine et la maintenance par l'IA.
- **Anti-Inflation Economy Test :** Chaque calcul de gain (Prestige, XP) doit être testé contre des valeurs aberrantes (Stress-test).
- **Save Regression Test :** Tout changement de schéma Zod **doit** s'accompagner d'un test chargeant une sauvegarde de version précédente.
- **Worker Simulation Timeout :** Tester que le moteur de match rend la main en moins de 10ms CPU par tick pour éviter les freezes mobiles.
- **Mocking Strategy :** Utiliser des mocks pour l'I/O (Dexie) et les timers lors des tests de simulation x15.

### 🚫 Critical Anti-Patterns (Zero Tolerance)

1. **Hidden Randomness :** INTERDICTION d'utiliser `Math.random()` directement dans la logique métier. Passer par le `SeedService`. Tout hasard doit être reproductible (Seedable) pour le debug et les tests.
2. **Save Shape Drift :** INTERDICTION de modifier la structure des sauvegardes sans versioning SemVer et migration Zod explicite.
3. **Business Logic in UI Store :** INTERDICTION de mettre du calcul métier dans les stores Zustand. Les stores servent à l'orchestration UI ; les calculs vivent dans les `domains/`.
4. **Cross-Domain Mutation :** INTERDICTION pour un domaine de modifier l'état interne d'un autre. Utiliser l'EventBus ou une Command applicative.
5. **Magic Numbers Everywhere :** INTERDICTION de coder en dur les coefficients (XP, Prestige, Drop rates). Tout doit provenir de `GameConfig.json`.
6. **Silent Fallback :** INTERDICTION de masquer une erreur critique par une valeur par défaut silencieuse (ex: ressource absente -> 0). Lever une `ERROR` structurée.
7. **Stringly-Typed IDs :** INTERDICTION de manipuler des IDs critiques en chaînes de caractères libres. Utiliser des Enums ou un Registry central.

### ⚠️ Gotchas & Edge Cases

- **Double Submit / Click :** Toute action critique (achat, récompense, fin de match) doit être **idempotente** ou protégée par un verrou UI.
- **Async Race Condition :** Ne jamais supposer l'ordre d'arrivée des écritures asynchrones. Utiliser une file d'exécution pour les opérations DB.
- **Stale Read After Write :** L'UI doit attendre la confirmation de l'écriture (Promise resolved) avant de rafraîchir l'affichage d'une progression.
- **Replay / Re-entry Duplication :** Unsubscribe systématique des listeners lors du démontage des composants ou scènes pour éviter les doublons de récompenses.
- **Null External Data :** Validation Zod systématique de TOUTES les données entrantes (JSON, DB, payloads IA). Ne jamais faire confiance à la structure supposée.

---

## 🎨 Design Workflow: Google Stitch Integration

FootballFever uses **Google Stitch** (stitch.withgoogle.com) as the primary AI-native design tool. Every UI component implementation must follow this collaborative loop:

### 1. 📝 Stitch Design Brief (Agent Responsibility)
Avant toute implémentation UI, l'agent doit générer un bloc de texte nommé `STITCH_PROMPT` contenant :
- **Objective :** Le rôle fonctionnel de l'écran (ex: "Draft Roguelite Selection").
- **Vibe :** L'esthétique visuelle (ex: "Futuristic Sports Management, neon green accents, dark glassmorphism").
- **Technical Constraints :** React 19, Tailwind CSS, Mobile-First.
- **Data Contracts :** Les props et états Zustand que le design doit manipuler.

### 2. 🎨 Design Generation (User Responsibility)
L'utilisateur injecte le `STITCH_PROMPT` dans Google Stitch et affine le design.

### 3. 📥 Design Handoff (Ground Truth)
L'utilisateur dépose le fichier **`DESIGN.md`** généré par Google Stitch à la racine du projet ou dans le dossier de la story.
- **Mandat Agent :** Le fichier `DESIGN.md` devient la **source de vérité absolue** pour les styles (couleurs, spacing, typography). L'agent a l'interdiction de s'en écarter.

### 4. 🧱 Implementation (Agent Responsibility)
L'agent implémente les composants React/Tailwind en mappant les design tokens de `DESIGN.md` vers les classes Tailwind.