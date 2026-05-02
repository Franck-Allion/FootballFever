---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'gdd'
lastStep: 14
project_name: 'FootballFever'
user_name: 'Fal'
date: '2026-05-02T14:22:56.706Z'
game_type: 'sports'
game_name: 'FootballFever'
---

# FootballFever - Game Design Document

**Author:** Fal
**Game Type:** Sports / RPG-Roguelite
**Target Platform(s):** Web / Mobile (PC later)

---

## Executive Summary

### Game Name

**FootballFever**

### Core Concept

**FootballFever** est un jeu de simulation de football hybride fusionnant la gestion tactique et la progression profonde des systèmes RPG/Rogue-lite. Le joueur dirige une équipe de 20 à 25 joueurs dans une quête de promotion à travers 4 divisions nationales et une coupe prestigieuse. 

Le cœur de l'expérience repose sur une boucle "One More Run" où chaque match n'est pas seulement un résultat sportif, mais une opportunité de récolter de l'expérience et de l'équipement rare. Les joueurs progressent individuellement via des arbres de statistiques et peuvent être équipés d'objets (chaussures, brassards, gants) impactant directement leurs performances sur le terrain via des **Bénédictions de Match** (effets synergiques déclenchés par des actions de jeu).

Le jeu intègre des mécaniques de **Draft** lors du Mercato, proposant des choix limités et stratégiques de joueurs, ainsi que des **Tactiques Légendaires** à usage unique fonctionnant comme des "sorts" tactiques. L'aspect financier est simplifié via un système de **Prestige** pour se concentrer sur l'optimisation de l'équipement. Le style visuel est coloré et cartoon, avec des équipements aux effets visuels marqués, rendant la simulation de match (accélérée x15) dynamique et engageante à travers des événements textuels interactifs.

### Game Type

**Type :** Sports Management / RPG-Roguelite
**Framework :** Ce GDD utilise le modèle **Sports** avec des sections spécifiques pour :
- La simulation de match textuelle/statistique (événements interactifs).
- Le système de Mercato (Draft) et de gestion de l'XP.
- Le système d'équipement (Loot/Stats/Prestige).

---

## Target Platform(s)

### Primary Platform
**Web / Mobile**

### Platform Considerations
- **Accessibilité :** Accès instantané via navigateur ou application mobile.
- **Performance :** L'esthétique cartoon et l'interface textuelle permettent une large compatibilité sur des appareils d'entrée de gamme.
- **Évolution :** Architecture pensée pour un portage futur sur **PC**, en exploitant la profondeur des données.

### Control Scheme
- **Tactile / Souris :** Navigation optimisée pour le "Point & Click" et le "Tap".
- **Interface :** Utilisation de menus contextuels et de glisser-déposer (Drag & Drop) pour l'équipement et les remplacements.

---

## Target Audience

### Demographics
**Âge :** Large (Public intergénérationnel attiré par le style visuel accessible et la profondeur thématique du football).

### Gaming Experience
**Joueurs "Core" optimisateurs :** Des joueurs qui apprécient la complexité des stats (RPG) et la répétabilité (Rogue-lite), mais qui recherchent une alternative plus nerveuse et moins chronophage que les simulations de gestion classiques.

### Genre Familiarity
**Hybride :** Joueurs familiers avec les codes du football et les mécaniques de progression RPG (XP, Loot).

### Session Length
**Courte (5-10 min) :** Idéal pour un match complet et une phase de gestion intermédiaire. La structure soutient aussi bien le jeu "sur le pouce" que des sessions prolongées de type "One more run".

### Design Principles (Mobile/UX)
- **Hiérarchie Visuelle ("Glanceable") :** Utilisation de Radar Charts pour une lecture immédiate des stats.
- **Feedback Visuel RPG :** Icônes colorées, auras et étincelles pour symboliser l'impact des équipements et des bénédictions en match.
- **Interactivité Tactile :** Quick Time Events tactiques pour briser la passivité de la simulation.

---

## Goals and Context

### Project Goals
- **Hybridation Réussie :** Marier la profondeur d'une simulation de football avec l'addiction d'un système de progression RPG/Rogue-lite.
- **Engagement "One more run" :** Créer une boucle de gameplay où chaque match et chaque inter-match apportent des micro-récompenses motivantes.
- **Accessibilité Tactique :** Rendre la gestion de statistiques complexe intuitive et gratifiante grâce à une interface "glanceable" et un style cartoon.

### Background and Rationale
Le marché des jeux de football est dominé par des simulations ultra-réalistes et chronophage. **FootballFever** comble le vide pour les joueurs "Core" qui aiment l'optimisation et la stratégie mais recherchent une expérience plus nerveuse, jouable sur mobile, où l'on peut "casser le jeu" grâce à un build intelligent plutôt que par une gestion de budget sur 10 ans.

---

## Unique Selling Points (USPs)

### 1. Rareté et Collection de Joueurs
Contrairement aux bases de données fixes, les joueurs apparaissent avec des niveaux de **Rareté (Commun à Légendaire)**. Un joueur "Légendaire" n'a pas seulement de meilleures stats, il possède un potentiel de croissance et des emplacements d'équipement uniques, rendant chaque Draft cruciale.

### 2. Le "Loot" Tactique & Bénédictions
L'équipement (chaussures, gants, etc.) ne se limite pas à des bonus numériques. Ils débloquent des **Bénédictions de Match** : des effets synergiques qui s'activent en fonction des actions de jeu, transformant votre équipe en une véritable composition RPG.

### 3. Mercato Typé "Draft"
Le recrutement n'est pas une liste de courses mais une série de choix cornéliens. Vous devez construire la meilleure équipe possible avec les options aléatoires proposées, forçant une adaptation constante à chaque "run" ou saison.

### 4. Simulation Interactive Accélérée
Le match de 3 minutes n'est pas passif. Via des **Tactiques Légendaires** et des **Quick Time Events tactiques**, le joueur intervient directement sur les moments clés, gardant un contrôle total sur l'issue de la rencontre.

---

## Core Gameplay

### Game Pillars

1. **Synergie & Optimisation (Le Build) :** Le succès dépend de la combinaison stratégique des équipements, des raretés de joueurs et des bénédictions.
2. **Décisions Sous Pression (Le Coach) :** Chaque choix (Draft, remplacements, Tactiques Légendaires) doit avoir un impact visible et immédiat.
3. **Progression Persistante (L'Héritage) :** Même dans la défaite, l'équipe grandit. La montée est un objectif de long terme nourri par l'accumulation de ressources.

**Priorité :** Optimisation > Décisions > Progression.

### Core Gameplay Loop

**Boucle :** Préparer (Gestion XP/Équipement/Mercato) -> Jouer (Match Interactif + Défis) -> Récolter (XP/Prestige).

- **Durée de la boucle :** ~10 minutes (7 min gestion / 3 min match).
- **Variation :** Les options de Draft aléatoires et le loot d'équipement garantissent que deux saisons ne se ressemblent pas.

### Win/Loss Conditions

#### Conditions de Victoire
- **Match :** Marquer plus de buts que l'adversaire (3 pts en championnat, qualification en coupe, 1 pt pour un nul).
- **Saison :** Finir dans les 3 premiers (Montée en division supérieure).
- **Ultime :** Remporter la Division 1 et la Coupe Nationale.

#### Conditions d'Échec
- **Match :** Défaite (0 pt) ou élimination directe en Coupe.
- **Saison :** Finir dans les 3 derniers (Relégation).

#### Récupération et Persistance (Failure Recovery)
- **L'échec n'est pas punitif :** Les joueurs conservent toute l'XP acquise, leurs statistiques et leur équipement d'une saison à l'autre.
- **Défis de Prestige :** Si la montée est compromise, des défis secondaires (ex: *"Zéro faute"*) permettent de récolter du Prestige massif pour préparer la saison suivante.

---

## Game Mechanics

### Primary Mechanics

#### Gestion de l'Effectif (Préparation)
- **Équipement (Loot/Build) :** Attribution d'objets aux joueurs pour débloquer des synergies et des boosts de stats.
- **Développement (XP) :** Attribution manuelle de points d'XP dans des statistiques précises.
- **Mercato (Draft) :** Recrutement basé sur des propositions aléatoires de joueurs aux raretés variables.
- **Maintenance (Santé & Moral) :**
    - **Soins :** Gestion des blessures.
    - **Repos :** Rotation de l'effectif pour gérer le **Physique** (Fatigue).
    - **Moral :** Impacté par les résultats.
        - **Choc de Relance :** Un nul ou une victoire contre plus fort restaure massivement le moral.
        - **Loot de Moral :** Certains équipements (ex: Brassard de Capitaine) immunisent contre la perte de moral.

#### Direction de Match (Action)
- **Commandement Tactique :** Changement de formation et remplacements en temps réel.
- **Tactiques Légendaires :** Capacités spéciales à usage unique (sorts tactiques).
- **Événements Critiques (QTE) :** Prise de décision textuelle rapide lors de moments clés.

### Mechanic Interactions
Le **Physique** et le **Moral** agissent comme des multiplicateurs. Le moral bas réduit la précision et augmente la fatigue, mas peut être contré par des objets spécifiques ou des victoires clés.

---

## Controls and Input

### Control Scheme (Web / Mobile)
- **Interface de Gestion Pure :** Pas de swipe/dextérité.
- **Navigation :** Tap/Click.
- **Interaction :** Drag & Drop pour l'équipement.
- **Réactivité :** Larges zones tactiles pour les actions de match.

### Représentation Visuelle (UX Mobile)
- **Météo du Vestiaire :** Système de lecture immédiate de l'état des troupes.
    - **Physique :** Jauge segmentée ou circulaire. Les joueurs épuisés voient leur portrait se désaturer (effet grisé).
    - **Moral :** Système d'Auras. Les joueurs "on fire" (Choc de Relance) possèdent un contour doré vibrant et des étincelles. Les baisses de moral sont signalées par des icônes de chevrons ou des filtres colorés.
- **Vue d'Ensemble :** Mode vignette permettant de scanner tout le roster en un seul écran via des codes couleurs (Vert/Orange/Rouge) pour la forme et le moral.

---

## Sports Game Specific Elements

### Sport-Specific Rules & Simulation
- **Format :** Matchs de 90 minutes simulés en **3 minutes (x15)**.
- **Moteur de Simulation :** Basé sur une suite de **possessions déterministes** (même seed = même match).
- **Règles :** Application des règles FIFA (Hors-jeu, fautes, cartons).
- **Incertitude :** Injection d'une variable aléatoire ("Hasard Contrôlé") permettant les exploits d'équipes plus faibles.
- **IA Tactique :** Comportement évolutif selon la division (Initiation en D4 vers Coach "Génius" réactif en D1, capable d'optimiser ses Tactiques Légendaires et de répondre aux changements du joueur).
- **Résolution des Égalités :** Match nul en championnat (1 pt) ; Prolongations et Tirs au but en Coupe.

### Match Structure (Sim-Engine)
Le match est décomposé en **Actions** au sein des possessions (Récupération → Passe → Duel → Tir).
- **Zones du Terrain :** Grille de 20 zones influençant les probabilités d'actions (ex: shootValue en BOX_CENTER).
- **MatchState :** État complet maintenu en temps réel (Score, Possession, Zone, Tempo, Profil de l'arbitre).
- **Statistiques Dynamiques :** Calculées en temps réel (xG, Passes, Corners, etc.) et non à posteriori.

### Team and Player Systems
#### Composites Statistiques (Internal Scores)
Les stats visibles produisent des scores internes pour la simulation :
- **Joueur de champ :** PassingScore, ProgressionScore, DuelScore, DefensiveScore, ShootingScore, AerialScore.
- **Gardien :** ShotStoppingScore, AerialGoalkeeperScore, PenaltySavingScore.
Ces scores sont pondérés par le **Physique** et le **Moral**.

#### Développement des Joueurs
- **Level Up :** Chaque niveau octroie **3 points de statistiques** à distribuer librement (n'importe quelle statistique).
- **Rareté :** Impacte le potentiel de croissance et les emplacements d'équipement (Commun à Légendaire).

### Interactive Events (Coach Choices)
Le moteur s'arrête lors d'événements à haute importance (Importance >= 0.70) :
1. **Pénaltys :** Choix du tireur (Précision vs Moral vs Doublé).
2. **Coups francs :** Tir direct vs Combinaison vs Centre.
3. **Corners :** Premier poteau vs Deuxième poteau vs Court.
4. **Contre-attaques :** Passe en profondeur vs Fixation vs Possession.
5. **Dernière passe :** Tir vs Passe axiale vs Écartement.
6. **Gestion humaine :** Remplacer un blessé ou un joueur sous carton jaune.
7. **Fin de match :** Verrouiller (Bloc bas) vs Tout pour l'attaque.

---

## Progression and Balance

### Player Progression (XP & Stats)
- **Système de Level Up :** Les joueurs gagnent de l'XP en fonction de leur temps de jeu et de leurs performances (Clean sheet, buts, etc.). Un passage de niveau octroie **3 points de statistiques**.
- **Courbe d'XP :** Progression rapide dans les premiers niveaux pour un sentiment immédiat de croissance, puis ralentissement progressif pour valoriser les vétérans.
- **Cap de Statistiques :** Toutes les statistiques sont plafonnées à **100 %**.
- **Synergie XP/Loot :** L'équipement applique des **multiplicateurs (%)** sur les stats de base. Un joueur haut niveau (XP) tirera un bénéfice bien plus grand d'un objet légendaire qu'un débutant.

### Gestion de la Carrière & Legacy
- **Cycle de Vie :** Les joueurs prennent leur retraite entre **30 et 38 ans**.
- **Prévisibilité :** Un indicateur "Compte à rebours de carrière" apparaît dès 32 ans pour permettre au joueur d'anticiper le remplacement.
- **Transmission (Coach Adjoint) :** Un joueur retraité peut être converti en **Coach de Spécialité**. Il apporte alors un bonus permanent aux joueurs occupant le même poste (ex: +5% XP ou boost stat spécifique).

### Économie et Ressources (Prestige)
- **La Boutique :** Vend uniquement des objets **Communs** (filet de sécurité) et des **Consommables** (soins, moral). Les prix scalent avec la division actuelle pour éviter l'inflation.
- **Loot de Match :** Les objets Peu Communs à Légendaires sont exclusivement obtenus via le loot de fin de match ou des événements spéciaux.
- **Offres Spéciales :** La réussite de plusieurs "Défis de Prestige" peut débloquer une offre temporaire dans la boutique pour un loot de haute rareté garanti.
- **Recyclage :** Possibilité de recycler 3 objets de rareté identique pour obtenir du Prestige massif ou une "Bénédiction de Match" aléatoire.

### Courbe de Difficulté (La Progression par Divisions)

Le jeu est structuré autour de paliers de difficulté appelés "Murs", forçant le joueur à optimiser ses builds pour progresser.

| Étape | Progression | XP par niveau | Loot moyen | Statistique moyenne adverse |
| :--- | :--- | :--- | :--- | :--- |
| **Saison 1 (D4)** | Initiation | Rapide | Commun | 15% |
| **Saison 3 (D3)** | Optimisation | Modérée | Peu commun | 40% |
| **Saison 6 (D2)** | Maîtrise | Lente | Rare | 65% |
| **Saison 9 (D1)** | Épique | Très lente | Épique / Légendaire | 90% |

#### Les Mécaniques du "Mur" (Division 1)
La Division 1 représente le défi ultime où la simple supériorité statistique ne suffit plus.
- **IA de Coach "Génius" :** En D1, l'IA adverse devient réactive. Elle utilise ses Tactiques Légendaires de manière optimale en réponse aux événements du match et réagit intelligemment aux remplacements du joueur.
- **Synergies Obligatoires :** La réussite en D1 impose une synergie parfaite de l'équipement. Les bonus individuels doivent être complétés par des combos d'objets entre les joueurs (ex: bonus de défense collective si tous les défenseurs portent une marque spécifique).
- **Gestion Critique du Prestige :** Le coût de maintenance (soins, moral) explose en D1. Chaque défaite a un impact financier et psychologique lourd, rendant la gestion des ressources aussi cruciale que le coaching de terrain.

### Récompense de la Percée (Breakthrough)
Percer le mur de la Division 1 débloque le contenu de "Endgame" :
- **Coupe d'Europe :** Une compétition prestigieuse hors MVP pour tester l'équipe contre l'élite absolue.
- **Équipements "Héritage" :** Accès à des objets ultimes aux effets uniques, transmissibles entre les générations de joueurs.

---

## Level Design Framework

### Level Types (Environnements de Jeu)
L'expérience utilisateur est structurée autour d'interfaces textuelles riches, colorées et intuitives, privilégiant l'iconographie claire au réalisme graphique complexe.
- **Le Hub de Gestion (Vestiaire) :** Environnement central pour l'optimisation (Stats/Loot/Santé). Utilisation de Radar Charts pour une lecture "glanceable".
- **L'Arène de Simulation (Le Terrain) :** Interface de match dynamique affichant les commentaires live, les graphiques de performance en temps réel et les zones tactiques.
- **Le Marché (Draft & Boutique) :** Interface dédiée aux choix de recrutement stratégiques et à l'achat de consommables de sécurité.

### Structure de la "Route vers la Gloire"
Le calendrier administratif est remplacé par une **Timeline horizontale scrollable** (ruban d'événements) inspirée des Rogue-lites.
- **Visualisation :** Le joueur scrolle horizontalement pour voir le passé et anticiper le futur.
- **Nœuds d'Événements :** 
    - ⚽ **Matchs :** Cartes colorées selon le niveau de danger adverse.
    - 🏆 **Coupe :** Nœuds dorés massifs pour les tours éliminatoires.
    - 🤝 **Mercato :** Zones colorées étendues indiquant les périodes de Draft.
- **Anticipation :** Permet au joueur de planifier sa gestion du **Physique** et du **Prestige** en fonction des pics de difficulté à venir.

### Rythme et Progression
- **Calendrier Réaliste :** Basé sur le modèle du football professionnel (Championnat de 16 équipes + Coupe Nationale).
- **Courbe de Difficulté :** Progression linéaire via 4 divisions (D4 à D1). Les adversaires voient leurs statistiques moyennes augmenter par palier (10-30% en D4 vers 70-100% en D1), avec une IA devenant plus agressive et synergique.
- **MVP Focus :** Pas de météo ou de qualité de terrain impactant le gameplay dans la version initiale.

---

## Art and Audio Direction

### Art Style
**Esthétique Cartoon / RPG :** Colorée, vive et lisible, privilégiant la clarté des données et le plaisir visuel du "build".
- **Identité des Joueurs :** Catalogue de visages cartoon. Chaque joueur possède un portrait statique mis en avant lors des commentaires live (vignette à gauche du texte).
- **Hiérarchie de Rareté :** Utilisation de cadres de couleurs spécifiques (Commun -> Légendaire) pour identifier immédiatement la valeur d'un joueur ou d'un objet.
- **Thèmes de Division :** Chaque division possède son propre logo et un thème colorimétrique dédié.

### "Visual Juice" (Dynamisme du Texte)
Pour compenser l'absence de 3D, le simulateur de match utilise des techniques d'impact visuel :
- **Freeze Frame :** Micro-pause de tension juste avant qu'une action critique ne se résolve.
- **Sismicité (Screen Shake) :** L'interface tremble lors des impacts majeurs (But, tacle puissant, arrêt réflexe).
- **Particules RPG :** Explosions de confettis, auras colorées et "dégâts de moral" numériques s'affichant au-dessus des icônes joueurs.
- **Animations GPU :** Utilisation de TextMeshPro et de transformations GPU pour garantir 60 FPS sur Web/Mobile.

### Audio and Music
- **Ambiance :** Sons de supporters discrets (chants, clameurs).
- **SFX Tactiques :** Bruitages de sifflet, de frappe et sons de menus (clics).
- **Feedback :** Jingle court pour les "Level Up" et les loots rares.

---

## Technical Specifications

### Stack Technique (Web / Mobile First)
- **Langage :** **TypeScript** (Logique métier, moteur de simulation, schémas de données).
- **Moteur de Jeu :** **Phaser 3** (Match, animations, particules, sons, effets visuels).
- **UI Applicative :** **React + Tailwind CSS** (Menus, gestion roster, inventaire, statistiques).
- **Gestion d'État :** **Zustand** (Store global pour la saison, le prestige et le roster).
- **Persistence :** **IndexedDB via Dexie** (Sauvegarde locale performante).
- **Desktop (Optionnel) :** **Tauri** (Version PC/Mac native utilisant la base Web).
- **Localisation :** Disponible en **Français, Anglais, Espagnol et Allemand**.

### Architecture & Communication
- **Event Bus (Pub/Sub) :** Utilisation d'un bus d'événements global (ex: Mitt) pour découpler React et Phaser. Phaser écoute les impulsions du moteur de simulation (ex: `GOAL_SCORED`) pour déclencher le "Visual Juice" sans latence.
- **Synchronisation :** React gère la structure persistante (Zustand), Phaser gère le rendu éphémère du match.

### Optimisation Performance
- **Code Splitting (Vite) :** Le moteur Phaser et ses assets ne sont chargés qu'au moment de l'entrée en match pour garantir un chargement initial instantané.
- **Rendu React :** Utilisation de **Virtual Lists** pour les commentaires live et `React.memo` pour optimiser le framerate lors de l'accélération x15.
- **Gestion Mémoire :** Utilisation d'**Atlas de Sprites** et déchargement agressif des ressources (images, sons) non nécessaires à l'interface courante pour économiser la RAM mobile.

### Robustesse & Sécurité des Données
- **Validation Zod :** Tous les schémas (joueurs, objets, MatchState) sont validés via Zod au chargement.
- **Système de Migration :** Scripts de migration automatisés avec Dexie pour garantir la compatibilité des sauvegardes lors des mises à jour (ex: ajout de la rareté).
- **Auto-save & Recovery :** Restauration automatique d'un backup sain en cas de corruption détectée par Zod.

---

## Development Epics

### Epic Structure
Le développement est découpé en **18 Épiques** thématiques, privilégiant une approche modulaire et testable :
- **E00 - E03 : Fondations & Données.** Initialisation technique (React/Phaser/TS), Localisation i18next, Sauvegarde versionnée Dexie/Zod, et Modélisation du domaine (Joueurs/Équipes).
- **E04 - E07 : Cœur de Simulation.** Boucle MVP jouable, Moteur de match déterministe (Possessions/Zones), Commentaires live localisés, et Événements interactifs entraîneur.
- **E08 - E11 : Gestion Humaine.** Gestion d'effectif, Progression XP, Calendrier en ruban (Route vers la Gloire), et systèmes de Fatigue/Moral/Blessures.
- **E12 - E14 : Économie & Roguelite.** Équipements/Raretés/Bénédictions, Économie de Prestige (Loot/Boutique/Recyclage), et Mercato Draft.
- **E15 - E18 : Finitions & Plateformes.** Interface Phaser hybride, Outils de Balancing (Batch Simulator), Polish visuel (Juice), et préparation Tauri (Desktop).

### Architecture & Pattern (Focus E05/Interaction)
Pour garantir la robustesse du système de coaching interactif :
- **State Machine :** Utilisation d'un `SimulationState` (`Running`, `DecisionPending`, `Finalized`) pour geler le "temps de simulation" sans arrêter le moteur de rendu (Phaser) ou l'interface (React).
- **Strategy Pattern :** Chaque type d'événement interactif (Penalty, Corner, Coup franc) implémente une interface commune, permettant d'étendre facilement le catalogue d'événements sans modifier le cœur de l'Engine.
- **Event-Driven Pause :** L'arrêt de la simulation est déclenché par un événement `INTERACTION_REQUIRED` sur le bus Mitt, assurant un découplage total entre la logique de match et les composants d'interface.

### Roadmap des Sprints (MVP Focus)
- **Sprint 0 :** Socle technique, Localisation, Sauvegarde et Modèles Player/Team.
- **Sprint 1 :** Moteur de match automatique (déterministe) et écran de match textuel.
- **Sprint 2 :** Boucle jouable Hub -> Match -> XP -> Sauvegarde.
- **Sprint 3 :** Réalisme du simulateur (Tirs, Fautes, Blessures) et Commentaires dynamiques.
- **Sprint 4 :** Coaching interactif (Pénaltys, Tactiques, Remplacements).
- **Sprint 5 :** Système de Saison (Championnat, Classement, Montées/Descentes).

---

## Success Metrics

### Technical Metrics

The technical success of **FootballFever** is measured by its performance on mobile/web browsers, ensuring a "snappy" and battery-friendly experience.

#### Key Technical KPIs

| Metric | Target (MVP) | Measurement Method |
| ------ | ------ | ------------------ |
| **Initial Load (LCP)** | ≤ 2.5 s | Lighthouse / Web Vitals |
| **Time to Interactive** | ≤ 3.5 s | Lighthouse |
| **Input Responsiveness (INP)** | ≤ 200 ms | Browser Performance API |
| **Screen Transitions** | ≤ 300 ms | Internal Telemetry |
| **Match Scene Load** | ≤ 3.0 s | Internal Telemetry |
| **Frame Rate (Match)** | 30 FPS stable (Low-end) | Phaser FPS meter |
| **Memory Usage (Total)** | < 250 MB | Browser Task Manager |
| **Session Endurance** | 0 crash / Heap < 250MB after 60 min | Stress Test / Memory Profiler |
| **Battery Drain (10 min)** | ≤ 5 % (Mid-range) | Manual Test / Device Log |

### Gameplay Metrics

Gameplay success is defined by the players' ability to enter the "flow" of the management/roguelite loop.

#### Key Gameplay KPIs

| Metric | Target | Measurement Method |
| ------ | ------ | ------------------ |
| **Day 1 Retention** | ≥ 40 % | Analytics (e.g., Mixpanel) |
| **Day 7 Retention** | ≥ 15 % | Analytics |
| **First Session Mastery** | 80 % complete 3 key actions | Funnel Analysis |
| **Build Diversity** | > 50 % players using 3+ item types | Equipment Analytics |
| **D2-D1 Funnel** | ≥ 20 % conversion rate | Progression Funnel |
| **Avg. Session Length** | 5 - 10 minutes | Analytics |

#### First Session "Golden Path"
A player is considered "activated" if they complete these 3 actions in their first session:
1. **Prepare**: Modify the starting lineup or equip an item.
2. **Decide**: Trigger a "Coach Choice" or "Legendary Tactic" during a match.
3. **Progress**: Spend XP or equip loot earned after a match.

### Qualitative Success Criteria

- **The "FM-Roguelite" Label**: Players and critics describe the game as "Football Manager meets Roguelite."
- **Build Sharing**: Players share screenshots of their unique player builds or legendary equipment sets.
- **Narrative Emergence**: Reviews mention specific match moments where a Legendary Tactic or a "Genius" AI move turned the tide.

### Metric Review Cadence

- **Technical Review**: Bi-weekly during development.
- **Gameplay Review**: After every 100 new players during alpha/beta phases (focus on D2-D1 funnel).



---

## Out of Scope (v1.0 MVP)

Pour garantir un lancement rapide et focalisé sur la boucle de gameplay "FM-Roguelite", les éléments suivants sont explicitement exclus de la version 1.0 :

- **Multijoueur en temps réel :** L'expérience est strictement solo (PvE). Un classement asynchrone pourra être envisagé plus tard.
- **Météo et État du terrain :** La simulation se concentre sur les statistiques pures des joueurs et de l'équipement, sans influence environnementale.
- **Commentaires Audio (Voice Acting) :** Les commentaires sont purement textuels, soutenus par des effets sonores (SFX) et de la musique.
- **Portage Console / VR :** Le focus initial est exclusivement Web et Mobile (via navigateur ou wrapper natif).
- **Éditeur de Niveau / Mod support :** Les outils de création pour les joueurs ne sont pas prévus pour le lancement.

### Deferred to Post-Launch (Nice to Have)
- Système d'enchères entre joueurs (Marché des transferts mondial).
- Visualisation 2D/3D détaillée des matchs (au-delà de l'interface textuelle enrichie).
- Retraite dynamique avec arbre généalogique des joueurs.

---

## Assumptions and Dependencies

### Key Assumptions
- **Performance Web :** Nous supposons que Phaser 3 et React peuvent cohabiter sans dégradation majeure des performances sur des appareils mobiles de milieu de gamme (3-4 ans d'âge).
- **Engagement Loop :** L'hypothèse centrale est que la fusion du loot Roguelite et de la gestion de football crée une rétention supérieure aux jeux de gestion classiques.
- **Data Persistence :** IndexedDB (via Dexie) est considéré comme suffisant pour stocker les sauvegardes locales de manière fiable sans serveur backend initial.

### External Dependencies
- **Asset Library :** Le projet dépend de l'acquisition ou de la création d'un catalogue de portraits cartoon cohérent (environ 100-200 variantes).
- **Localization Services :** Dépendance à des traducteurs (ou outils d'IA) pour valider la qualité des 300+ commentaires dans les 4 langues cibles.

### Risk Factors
- **Memory Leaks :** Risque élevé de saturation mémoire sur mobile dû au grand nombre de micro-événements et d'images (portraits). *Atténuation : Virtualisation agressive et lazy-loading.*
- **Balancing Complexity :** L'IA "Génius" et les synergies d'équipement pourraient rendre le jeu trop facile ou frustrant. *Atténuation : Batch simulator (10 000 matchs) pour tester l'équilibre.*

---

## Document Information

**Document:** FootballFever - Game Design Document
**Version:** 1.0
**Created:** 2026-05-02
**Author:** Fal
**Status:** Complete

### Change Log

| Version | Date | Changes |
| ------- | -------- | -------------------- |
| 1.0 | 2026-05-02 | Initial GDD complete |
