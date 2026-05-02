Voici une proposition structurée pour intégrer un catalogue d’événements interactifs au moteur de simulation. L’objectif est que le moteur produise à la fois :

un match crédible, basé sur possessions, zones, tactiques et stats joueurs ;
des événements où l’entraîneur doit choisir ;
des statistiques de fin de match réalistes, dérivées du déroulement réel simulé, et non inventées après coup ;
une spécification assez claire pour être donnée à une IA de développement comme Gemini.
1. Principe central

Le match ne doit pas être simulé comme une suite de minutes indépendantes.

Il doit être simulé comme une suite de possessions.

Chaque possession contient plusieurs actions :

Récupération → Passe → Passe progressive → Duel → Centre → Tir → Corner → Second ballon → etc.

Chaque action peut générer :

- une statistique
- un commentaire live
- une transition de possession
- un événement secondaire : faute, carton, blessure, hors-jeu, corner...
- un breakpoint interactif pour l’entraîneur

Les statistiques de fin de match sont donc simplement la somme des événements générés.

Exemple :

Action simulée : passe courte réussie
→ home.passesAttempted += 1
→ home.passesCompleted += 1
→ possessionTime += 6 secondes
→ commentaire : "Martin temporise et trouve Durand dans l’axe."

Autre exemple :

Action simulée : tir cadré arrêté
→ home.shots += 1
→ home.shotsOnTarget += 1
→ away.goalkeeperSaves += 1
→ commentaire : "Superbe arrêt du gardien !"
→ selon le rebond : corner, dégagement ou second ballon
2. État complet du match

Le moteur doit maintenir un MatchState unique.

{
  "matchId": "D1_JOURNEE_04_TEAM_A_TEAM_B",
  "seed": 184729,
  "minute": 0,
  "second": 0,
  "period": 1,
  "score": {
    "home": 0,
    "away": 0
  },
  "possessionTeam": "home",
  "ballZone": "MID_CENTER",
  "currentPhase": "OPEN_PLAY",
  "matchTempo": 0.52,
  "refereeProfile": {
    "severity": 0.58,
    "advantageTolerance": 0.46,
    "foulSensitivity": 0.61,
    "redCardStrictness": 0.42
  },
  "homeTactic": {
    "formation": "4-3-3",
    "mentality": "BALANCED",
    "pressing": 0.62,
    "defensiveLine": 0.58,
    "width": 0.66,
    "tempo": 0.57,
    "riskTaking": 0.52
  },
  "awayTactic": {
    "formation": "5-3-2",
    "mentality": "DEFENSIVE",
    "pressing": 0.44,
    "defensiveLine": 0.39,
    "width": 0.48,
    "tempo": 0.42,
    "riskTaking": 0.35
  },
  "homeStats": {},
  "awayStats": {},
  "eventLog": [],
  "pendingCoachChoice": null
}

Le moteur doit être déterministe :

Même seed + mêmes compositions + mêmes choix entraîneur = même match.

Cela permettra de sauvegarder, rejouer, tester et débugger facilement.

3. Zones du terrain

Pour le MVP, je recommande une grille simple de 20 zones.

DEF_LEFT      DEF_HALF_LEFT      DEF_HALF_RIGHT      DEF_RIGHT
LOWMID_LEFT   LOWMID_CENTER_L    LOWMID_CENTER_R     LOWMID_RIGHT
MID_LEFT      MID_CENTER_L       MID_CENTER_R        MID_RIGHT
HIGH_LEFT     HIGH_HALF_LEFT     HIGH_HALF_RIGHT     HIGH_RIGHT
BOX_LEFT      BOX_CENTER_L       BOX_CENTER_R        BOX_RIGHT

Chaque zone doit avoir des coefficients :

{
  "zoneId": "BOX_CENTER_L",
  "distanceToGoal": 0.12,
  "shootValue": 0.92,
  "crossValue": 0.30,
  "throughPassValue": 0.72,
  "foulDanger": 0.88,
  "offsideRisk": 0.64,
  "cornerProbabilityOnBlockedShot": 0.22
}

Plus la zone est proche du but, plus les événements importants sont probables.

4. Statistiques de match à produire

Les stats ne doivent pas être générées à la fin. Elles doivent être alimentées pendant la simulation.

Structure recommandée :

{
  "possessionSeconds": 0,
  "passesAttempted": 0,
  "passesCompleted": 0,
  "progressivePasses": 0,
  "keyPasses": 0,
  "crossesAttempted": 0,
  "crossesCompleted": 0,
  "shots": 0,
  "shotsOnTarget": 0,
  "shotsOffTarget": 0,
  "blockedShots": 0,
  "goals": 0,
  "xG": 0.0,
  "bigChances": 0,
  "bigChancesMissed": 0,
  "corners": 0,
  "offsides": 0,
  "foulsCommitted": 0,
  "foulsSuffered": 0,
  "yellowCards": 0,
  "redCards": 0,
  "injuries": 0,
  "saves": 0,
  "penaltiesWon": 0,
  "penaltiesScored": 0,
  "penaltiesMissed": 0,
  "freeKicks": 0,
  "tacklesAttempted": 0,
  "tacklesWon": 0,
  "duelsAttempted": 0,
  "duelsWon": 0
}

À la fin :

possession% home = home.possessionSeconds / totalPossessionSeconds
possession% away = away.possessionSeconds / totalPossessionSeconds
5. Fourchettes réalistes à viser par match

Ces fourchettes servent à calibrer ton moteur. Elles ne doivent pas être forcées match par match, mais vérifiées sur des centaines ou milliers de simulations.

Pour une équipe sur 90 minutes :

Stat	Fourchette réaliste moyenne
Passes tentées	300 à 650
Passes réussies	230 à 580
Précision de passe	70 % à 90 %
Tirs	7 à 18
Tirs cadrés	2 à 7
Buts	0 à 3 la plupart du temps
Corners	2 à 8
Hors-jeu	0 à 4
Fautes commises	7 à 18
Cartons jaunes	0 à 4
Cartons rouges	rare, environ 0 ou 1
Blessures en match	rare, 0 ou 1 la plupart du temps

Les équipes très fortes doivent naturellement produire :

plus de possession
plus de passes
plus de tirs
plus de xG
moins de tirs concédés

Mais il faut garder de la variance : une équipe faible doit parfois gagner.

6. Boucle principale de simulation

Pseudo-code clair pour Gemini :

function SimulateMatchUntilNextBreakpoint(matchState):

    while matchState.minute < 90 + addedTime:

        UpdateFatigue(matchState)
        UpdateMomentum(matchState)
        UpdateTeamMentalities(matchState)

        possession = CreateOrContinuePossession(matchState)

        actionContext = BuildActionContext(matchState, possession)

        possibleActions = GetPossibleActions(actionContext)

        selectedAction = ChooseActionWithWeightedProbabilities(possibleActions, actionContext)

        actionResult = ResolveAction(selectedAction, actionContext)

        ApplyActionResultToMatchState(matchState, actionResult)

        UpdateStatistics(matchState, actionResult)

        AddLiveCommentary(matchState, actionResult)

        secondaryEvents = GenerateSecondaryEvents(matchState, actionResult)

        for each secondaryEvent in secondaryEvents:
            ApplyEvent(matchState, secondaryEvent)
            UpdateStatistics(matchState, secondaryEvent)
            AddLiveCommentary(matchState, secondaryEvent)

        if ShouldTriggerCoachChoice(matchState, actionResult, secondaryEvents):
            matchState.pendingCoachChoice = CreateCoachChoice(matchState, actionResult)
            return matchState

        AdvanceClock(matchState, actionResult)

    FinalizeMatch(matchState)
    return matchState

Le moteur s’arrête uniquement quand un choix entraîneur est requis.

L’interface peut ensuite afficher :

- les commentaires accumulés
- les stats live
- le choix proposé

Puis l’utilisateur choisit, et la simulation reprend.

7. Système de probabilité générique

Toutes les actions doivent suivre la même philosophie :

probabilité = base
            + impact du joueur
            + impact de la tactique
            + impact de la zone
            + impact de la fatigue
            + impact du moral
            + impact de l’adversaire
            + impact du score et de la minute
            + hasard contrôlé

Forme simple :

score = baseWeight
score += playerSkill * playerWeight
score += tacticModifier
score += zoneModifier
score += fatigueModifier
score += moraleModifier
score += opponentPressureModifier
score += matchContextModifier

probability = Clamp(score, minProbability, maxProbability)

Pour un MVP, il vaut mieux éviter des formules trop opaques. Il faut des formules lisibles, testables et ajustables.

8. Composites joueurs recommandés

Tes stats visibles doivent produire des scores internes.

Joueur de champ
PassingScore =
    Passes * 0.50
  + Relance * 0.25
  + Moral * 0.15
  + Endurance * 0.10

ProgressionScore =
    Relance * 0.35
  + Passes * 0.30
  + Vitesse * 0.20
  + Moral * 0.15

DuelScore =
    Duels * 0.40
  + Physique * 0.30
  + Vitesse * 0.15
  + Moral * 0.15

DefensiveScore =
    Tacles * 0.40
  + Duels * 0.25
  + Physique * 0.20
  + Endurance * 0.15

ShootingScore =
    Frappe * 0.55
  + Moral * 0.20
  + Vitesse * 0.10
  + Physique * 0.05
  + JeuDeTete * 0.10

AerialScore =
    JeuDeTete * 0.45
  + Physique * 0.30
  + Duels * 0.20
  + Moral * 0.05
Gardien
ShotStoppingScore =
    ArretSurLaLigne * 0.35
  + Reflexe * 0.30
  + Plongeon * 0.25
  + Moral * 0.10

AerialGoalkeeperScore =
    SortieAerienne * 0.35
  + SortieSurCorner * 0.35
  + Reflexe * 0.15
  + Moral * 0.15

PenaltySavingScore =
    Reflexe * 0.40
  + Plongeon * 0.30
  + ArretSurLaLigne * 0.20
  + Moral * 0.10
9. Catalogue d’événements interactifs

Chaque événement interactif doit être défini par une fiche standard.

{
  "eventId": "PENALTY_TAKER_CHOICE",
  "category": "SET_PIECE",
  "trigger": {},
  "importance": 0.95,
  "coachPrompt": "Penalty obtenu ! Qui doit tirer ?",
  "choices": [],
  "resolution": {},
  "statImpacts": {},
  "commentaryTags": []
}

9.1 Penalty obtenu
Déclencheur
Une faute défensive est commise dans la surface
ET la faute correspond à un coup franc direct
Choix proposés
[
  {
    "choiceId": "BEST_SHOOTER",
    "label": "Faire tirer le meilleur finisseur",
    "risk": "normal",
    "effects": {
      "usePlayerWithHighest": "PenaltyScore"
    }
  },
  {
    "choiceId": "CONFIDENT_PLAYER",
    "label": "Faire tirer le joueur avec le meilleur moral",
    "risk": "normal",
    "effects": {
      "moraleBonus": 0.05
    }
  },
  {
    "choiceId": "GOAL_HUNGRY_STRIKER",
    "label": "Donner le penalty à l’attaquant qui cherche un doublé",
    "risk": "medium",
    "effects": {
      "shooterMoraleIfScored": 0.12,
      "shooterMoraleIfMissed": -0.15
    }
  }
]
Résolution
PenaltyScore =
    Frappe * 0.45
  + Moral * 0.30
  + Physique * 0.10
  + ExperienceHidden * 0.15

GoalkeeperPenaltyScore =
    Reflexe * 0.40
  + Plongeon * 0.30
  + ArretSurLaLigne * 0.20
  + Moral * 0.10

baseConversion = 0.76

pGoal =
    baseConversion
  + (PenaltyScore - GoalkeeperPenaltyScore) * 0.0025
  + moraleModifier
  - pressureModifier

pGoal = Clamp(pGoal, 0.55, 0.90)
Statistiques
shots += 1
shotsOnTarget += 1 dans la majorité des cas
penaltiesWon += 1
penaltiesScored += 1 si but
penaltiesMissed += 1 si raté ou arrêté
xG += 0.76 environ
9.2 Coup franc dangereux
Déclencheur
Faute subie dans une zone proche du but
Distance au but inférieure à un seuil
Angle de tir acceptable
Choix proposés
[
  {
    "choiceId": "DIRECT_SHOT",
    "label": "Tenter le tir direct",
    "risk": "high",
    "effects": {
      "shotProbabilityBonus": 0.20,
      "possessionLossRisk": 0.45
    }
  },
  {
    "choiceId": "CROSS_TO_BOX",
    "label": "Chercher les grands joueurs dans la surface",
    "risk": "medium",
    "effects": {
      "aerialDuelBonus": 0.12
    }
  },
  {
    "choiceId": "SHORT_COMBINATION",
    "label": "Jouer une combinaison courte",
    "risk": "medium",
    "effects": {
      "surpriseBonus": 0.08,
      "turnoverRisk": 0.18
    }
  }
]
Résolution tir direct
FreeKickShotScore =
    Frappe * 0.40
  + Relance * 0.20
  + Moral * 0.20
  + HiddenSetPieceSkill * 0.20

pOnTarget = 0.28 + FreeKickShotScore * 0.003 - distancePenalty
pGoal = 0.05 + FreeKickShotScore * 0.0015 - goalkeeperScore * 0.001
Stats
freeKicks += 1
shots += 1 si tir direct
shotsOnTarget += 1 si cadré
shotsOffTarget += 1 si non cadré
xG += valeur entre 0.03 et 0.12 selon distance/angle
9.3 Corner important
Déclencheur
Corner obtenu
ET score serré
OU fin de mi-temps
OU équipe menée
OU très bonne menace aérienne
Choix proposés
[
  {
    "choiceId": "NEAR_POST",
    "label": "Corner au premier poteau",
    "risk": "medium",
    "effects": {
      "firstContactBonus": 0.10,
      "clearanceRisk": 0.12
    }
  },
  {
    "choiceId": "FAR_POST",
    "label": "Corner au second poteau",
    "risk": "medium",
    "effects": {
      "aerialDuelBonus": 0.12,
      "counterAttackRisk": 0.08
    }
  },
  {
    "choiceId": "SHORT_CORNER",
    "label": "Jouer le corner à deux",
    "risk": "low",
    "effects": {
      "possessionRetentionBonus": 0.18,
      "immediateShotPenalty": -0.08
    }
  },
  {
    "choiceId": "PACKED_BOX",
    "label": "Envoyer beaucoup de joueurs dans la surface",
    "risk": "high",
    "effects": {
      "shotChanceBonus": 0.12,
      "counterAttackRisk": 0.20
    }
  }
]
Résolution
DeliveryQuality =
    Passes * 0.35
  + Relance * 0.25
  + Moral * 0.15
  + HiddenSetPieceSkill * 0.25

AttackingAerial =
    moyenne pondérée des 3 meilleurs joueurs aériens dans la surface

DefendingAerial =
    moyenne pondérée des meilleurs défenseurs + gardien aérien

pFirstContact =
    0.35
  + (DeliveryQuality - 50) * 0.003
  + (AttackingAerial - DefendingAerial) * 0.004
  + routineModifier

pShotAfterCorner = environ 0.20 à 0.30
pGoalAfterCorner = environ 0.02 à 0.05
Stats
corners += 1
crossesAttempted += 1 sauf corner court
shots += 1 si reprise
shotsOnTarget / shotsOffTarget / blockedShots selon résultat
xG += 0.02 à 0.15 selon occasion
9.4 Contre-attaque à fort potentiel
Déclencheur
Récupération haute ou récupération après corner adverse
ET défense adverse déséquilibrée
ET joueur rapide disponible
Choix proposés
[
  {
    "choiceId": "THROUGH_BALL",
    "label": "Lancer immédiatement l’attaquant en profondeur",
    "risk": "high",
    "effects": {
      "bigChanceBonus": 0.18,
      "offsideRiskBonus": 0.12,
      "turnoverRisk": 0.20
    }
  },
  {
    "choiceId": "CARRY_BALL",
    "label": "Porter le ballon pour fixer la défense",
    "risk": "medium",
    "effects": {
      "duelRequired": true,
      "fatigueCost": 0.04
    }
  },
  {
    "choiceId": "SAFE_PASS",
    "label": "Assurer la possession",
    "risk": "low",
    "effects": {
      "possessionRetentionBonus": 0.25,
      "bigChancePenalty": -0.12
    }
  }
]
Résolution passe en profondeur
ThroughBallScore =
    passer.ProgressionScore * 0.45
  + receiver.Vitesse * 0.30
  + receiver.Moral * 0.10
  + tactic.riskTaking * 15
  + opponentDefensiveLine * 10

pSuccess =
    0.32
  + (ThroughBallScore - defensiveCoverageScore) * 0.004
  - pressure * 0.15

pOffside =
    0.04
  + opponentDefensiveLine * 0.10
  + receiverRunRisk * 0.08
  - passerTimingScore * 0.04
Stats
passesAttempted += 1
passesCompleted += 1 si réussite
progressivePasses += 1
offsides += 1 si hors-jeu
bigChances += 1 si face-à-face généré
9.5 Choix de dernière passe
Déclencheur
L’équipe arrive dans les 25 derniers mètres
ET plusieurs options offensives sont disponibles
ET Importance élevée
Choix proposés
[
  {
    "choiceId": "SHOOT",
    "label": "Frapper maintenant",
    "risk": "medium",
    "effects": {
      "immediateShot": true
    }
  },
  {
    "choiceId": "PASS_TO_STRIKER",
    "label": "Chercher l’attaquant dans l’axe",
    "risk": "high",
    "effects": {
      "xGBonusIfSuccess": 0.15,
      "interceptionRisk": 0.18
    }
  },
  {
    "choiceId": "PLAY_WIDE",
    "label": "Écarter sur l’aile",
    "risk": "low",
    "effects": {
      "crossOpportunity": true,
      "possessionRetentionBonus": 0.10
    }
  }
]
Résolution

Le moteur compare :

ExpectedValue(choice) =
    probabilitySuccess * expectedXGAfterSuccess
  - probabilityFailure * counterAttackRisk

Mais côté joueur, il faut afficher une information qualitative :

- Option sûre
- Option équilibrée
- Option risquée mais dangereuse
9.6 Joueur blessé ou diminué
Déclencheur
Blessure légère détectée
OU fatigue très élevée
OU joueur revient d’une blessure
OU charge récente importante
Choix proposés
[
  {
    "choiceId": "KEEP_ON_FIELD",
    "label": "Le laisser sur le terrain",
    "risk": "high",
    "effects": {
      "currentPerformancePenalty": -0.10,
      "injuryWorseningRisk": 0.12
    }
  },
  {
    "choiceId": "SUBSTITUTE",
    "label": "Le remplacer",
    "risk": "low",
    "effects": {
      "useSubstitution": 1,
      "injuryWorseningRisk": -0.10
    }
  },
  {
    "choiceId": "REDUCE_INTENSITY",
    "label": "Adapter la tactique pour le protéger",
    "risk": "medium",
    "effects": {
      "teamPressingPenalty": -0.08,
      "injuryWorseningRisk": -0.06
    }
  }
]
Résolution
pWorsen =
    baseInjuryWorsening
  + fatigue * 0.15
  + fragility * 0.10
  + matchIntensity * 0.08
  - protectionChoiceModifier
Stats
injuries += 1 uniquement si blessure confirmée
player.injuryStatus mis à jour
player.performanceModifier mis à jour
9.7 Défenseur sous carton jaune exposé
Déclencheur
Défenseur ou milieu défensif a déjà un jaune
ET affronte un joueur rapide/dribbleur
ET l’équipe subit beaucoup d’attaques dans sa zone
Choix proposés
[
  {
    "choiceId": "KEEP_AGGRESSIVE",
    "label": "Continuer à défendre agressivement",
    "risk": "high",
    "effects": {
      "defensiveDuelBonus": 0.10,
      "secondYellowRisk": 0.10
    }
  },
  {
    "choiceId": "ASK_TO_BE_CAREFUL",
    "label": "Lui demander d’être prudent",
    "risk": "medium",
    "effects": {
      "defensiveDuelPenalty": -0.08,
      "secondYellowRisk": -0.08
    }
  },
  {
    "choiceId": "SUBSTITUTE",
    "label": "Le remplacer",
    "risk": "low",
    "effects": {
      "useSubstitution": 1,
      "secondYellowRisk": -0.15
    }
  }
]
Effet sur simulation
Si KEEP_AGGRESSIVE :
    plus de tacles réussis
    plus de fautes
    plus de risque rouge

Si ASK_TO_BE_CAREFUL :
    moins de fautes
    plus de centres ou tirs concédés

Si SUBSTITUTE :
    dépend du niveau du remplaçant

9.8 Carton rouge : réorganisation tactique
Déclencheur
Un joueur est exclu
Choix proposés
[
  {
    "choiceId": "DEFENSIVE_BLOCK",
    "label": "Passer en bloc bas",
    "risk": "low",
    "effects": {
      "formationMentality": "DEFENSIVE",
      "pressing": -0.20,
      "defensiveCompactness": 0.18,
      "attackThreat": -0.20
    }
  },
  {
    "choiceId": "BALANCED_RESHAPE",
    "label": "Rééquilibrer l’équipe",
    "risk": "medium",
    "effects": {
      "requiresPositionReassignment": true
    }
  },
  {
    "choiceId": "KEEP_ATTACKING",
    "label": "Continuer à attaquer malgré l’infériorité",
    "risk": "high",
    "effects": {
      "attackThreat": 0.08,
      "defensiveRisk": 0.25,
      "fatigueCost": 0.12
    }
  }
]
Effet

Le moteur doit recalculer immédiatement les indices d’équipe :

TeamAttackIndex
TeamDefenseIndex
PressingIndex
WidthIndex
CounterAttackRisk
FatigueRate
9.9 Gardien face à un penalty

Si ton jeu permet aussi des choix défensifs, on peut déclencher un événement côté gardien.

Choix proposés
[
  {
    "choiceId": "DIVE_LEFT",
    "label": "Plonger à gauche",
    "risk": "normal"
  },
  {
    "choiceId": "DIVE_RIGHT",
    "label": "Plonger à droite",
    "risk": "normal"
  },
  {
    "choiceId": "STAY_CENTER",
    "label": "Rester au centre",
    "risk": "high"
  }
]

Pour éviter que ce soit purement aléatoire, tu peux afficher des indices :

"Le tireur semble préférer ouvrir son pied."
"Le tireur a l’air nerveux."
"Ton gardien pense qu’il va croiser sa frappe."

Ces indices peuvent être vrais ou partiellement trompeurs selon :

goalkeeper.Reflexe
goalkeeper.Moral
shooter.Moral
shooter.HiddenComposure
9.10 Fin de match : gestion du score
Déclencheur
Après la 75e minute
ET score serré
ET importance du match élevée
Choix si l’équipe mène
[
  {
    "choiceId": "PROTECT_LEAD",
    "label": "Fermer le match",
    "effects": {
      "mentality": "DEFENSIVE",
      "tempo": -0.15,
      "riskTaking": -0.20,
      "timeWastingRisk": 0.08
    }
  },
  {
    "choiceId": "KEEP_BALANCE",
    "label": "Rester équilibré",
    "effects": {
      "mentality": "BALANCED"
    }
  },
  {
    "choiceId": "PUSH_FOR_MORE",
    "label": "Chercher à tuer le match",
    "effects": {
      "attackThreat": 0.10,
      "counterAttackRisk": 0.15
    }
  }
]
Choix si l’équipe perd
[
  {
    "choiceId": "ALL_OUT_ATTACK",
    "label": "Tout donner offensivement",
    "effects": {
      "attackThreat": 0.20,
      "defensiveRisk": 0.25,
      "fatigueCost": 0.15
    }
  },
  {
    "choiceId": "CONTROLLED_PRESSURE",
    "label": "Augmenter progressivement la pression",
    "effects": {
      "pressing": 0.12,
      "tempo": 0.10,
      "defensiveRisk": 0.08
    }
  },
  {
    "choiceId": "ACCEPT_RESULT",
    "label": "Limiter les dégâts",
    "effects": {
      "injuryRisk": -0.08,
      "fatigueCost": -0.10,
      "attackThreat": -0.12
    }
  }
]
10. Catalogue technique complet des événements

Voici une base de catalogue pour le MVP.

EventId	Interactif	Fréquence	Impact
PENALTY_TAKER_CHOICE	Oui	Rare	Très fort
DANGEROUS_FREE_KICK_CHOICE	Oui	Moyen	Fort
CORNER_ROUTINE_CHOICE	Oui	Moyen	Moyen
HIGH_VALUE_COUNTER_ATTACK	Oui	Moyen	Fort
FINAL_PASS_DECISION	Oui	Moyen	Fort
INJURED_PLAYER_DECISION	Oui	Rare	Fort
YELLOW_CARD_RISK_DECISION	Oui	Moyen	Moyen
RED_CARD_REORGANIZATION	Oui	Très rare	Très fort
LATE_GAME_STRATEGY	Oui	Moyen	Fort
SUBSTITUTION_RECOMMENDATION	Oui	Moyen	Moyen
TACTICAL_WEAKNESS_ALERT	Oui	Moyen	Moyen
OPPONENT_DOMINATION_ALERT	Oui	Moyen	Moyen
PLAYER_MORALE_MOMENT	Oui	Rare	Moyen
GOALKEEPER_UNDER_PRESSURE	Oui	Rare	Moyen
SET_PIECE_DEFENSE_CHOICE	Oui	Moyen	Moyen

Les événements non interactifs restent nombreux :

PASS_COMPLETED
PASS_FAILED
DUEL_WON
DUEL_LOST
SHOT_ON_TARGET
SHOT_OFF_TARGET
SHOT_BLOCKED
GOAL
SAVE
CORNER_WON
OFFSIDE
FOUL
YELLOW_CARD
RED_CARD
INJURY_LIGHT
INJURY_MEDIUM
INJURY_SEVERE
SUBSTITUTION
TACTIC_CHANGED

11. Format JSON recommandé pour le catalogue

Tu peux stocker le catalogue dans des fichiers JSON ou ScriptableObjects Unity.

Exemple complet :

{
  "eventId": "HIGH_VALUE_COUNTER_ATTACK",
  "displayNameKey": "match.event.counter_attack.title",
  "category": "OPEN_PLAY",
  "isInteractive": true,
  "cooldownSeconds": 300,
  "maxOccurrencesPerMatch": 3,
  "trigger": {
    "phase": "TRANSITION",
    "minImportance": 0.72,
    "requiredContext": {
      "opponentDefensiveBalanceMax": 0.45,
      "ballZoneMinDanger": 0.55,
      "availableFastRunner": true
    }
  },
  "choices": [
    {
      "choiceId": "THROUGH_BALL",
      "labelKey": "match.choice.through_ball",
      "riskLevel": "HIGH",
      "effects": {
        "bigChanceModifier": 0.18,
        "turnoverModifier": 0.20,
        "offsideModifier": 0.12,
        "fatigueCost": 0.03
      }
    },
    {
      "choiceId": "CARRY_BALL",
      "labelKey": "match.choice.carry_ball",
      "riskLevel": "MEDIUM",
      "effects": {
        "duelRequired": true,
        "bigChanceModifier": 0.08,
        "fatigueCost": 0.05
      }
    },
    {
      "choiceId": "SAFE_PASS",
      "labelKey": "match.choice.safe_pass",
      "riskLevel": "LOW",
      "effects": {
        "possessionRetentionModifier": 0.20,
        "bigChanceModifier": -0.10
      }
    }
  ],
  "resolutionModel": "COUNTER_ATTACK_RESOLUTION",
  "commentaryTags": [
    "counter_attack",
    "transition",
    "coach_choice"
  ]
}

Note importante pour ton projet : comme tu utilises Unity Localization, displayNameKey et labelKey doivent pointer vers des String Tables FR/EN, pas vers du texte codé en dur.

12. Calcul du score d’importance d’un événement

Tous les événements ne doivent pas interrompre le joueur.

Il faut déclencher un choix seulement si l’événement est important.

importance =
    baseEventImportance
  + xGThreat * 0.35
  + scorePressure * 0.20
  + timePressure * 0.15
  + matchImportance * 0.15
  + playerImpact * 0.10
  + rarityBonus * 0.05

Exemple :

Penalty à la 12e minute à 0-0 :
importance élevée

Corner à la 4e minute :
importance moyenne, pas forcément interactif

Corner à la 89e minute alors que le joueur perd 1-0 :
importance très élevée, interactif

Seuil recommandé :

if importance >= 0.70:
    trigger coach choice
else:
    simulate automatically
13. Génération des commentaires live

Chaque événement doit produire un commentaire.

Exemple de structure :

{
  "eventType": "SHOT_ON_TARGET",
  "minute": 34,
  "team": "home",
  "mainPlayerId": "PLAYER_12",
  "secondaryPlayerId": "PLAYER_01_AWAY",
  "zone": "BOX_CENTER_R",
  "xG": 0.31,
  "commentaryKey": "commentary.shot.saved.big_chance"
}

La couche commentaire peut ensuite choisir une phrase selon l’intensité :

xG < 0.05 :
"Il tente sa chance de loin, mais ce n’est pas cadré."

xG entre 0.05 et 0.20 :
"Bonne frappe, mais le gardien est vigilant."

xG > 0.30 :
"Énorme occasion ! Le gardien sauve son équipe !"
14. Mise à jour des statistiques par événement

Il faut créer un StatsAccumulator.

Pseudo-code :

function ApplyStats(event, matchStats):

    teamStats = matchStats.GetTeamStats(event.team)

    switch event.type:

        case PASS_COMPLETED:
            teamStats.passesAttempted += 1
            teamStats.passesCompleted += 1
            if event.isProgressive:
                teamStats.progressivePasses += 1

        case PASS_FAILED:
            teamStats.passesAttempted += 1

        case SHOT_ON_TARGET:
            teamStats.shots += 1
            teamStats.shotsOnTarget += 1
            teamStats.xG += event.xG

        case SHOT_OFF_TARGET:
            teamStats.shots += 1
            teamStats.shotsOffTarget += 1
            teamStats.xG += event.xG

        case SHOT_BLOCKED:
            teamStats.shots += 1
            teamStats.blockedShots += 1
            teamStats.xG += event.xG

        case GOAL:
            teamStats.goals += 1

        case SAVE:
            teamStats.saves += 1

        case CORNER_WON:
            teamStats.corners += 1

        case OFFSIDE:
            teamStats.offsides += 1

        case FOUL_COMMITTED:
            teamStats.foulsCommitted += 1
            opponentStats.foulsSuffered += 1

        case YELLOW_CARD:
            teamStats.yellowCards += 1

        case RED_CARD:
            teamStats.redCards += 1

        case INJURY:
            teamStats.injuries += 1

Important : un but doit souvent être accompagné d’un tir.

Si GOAL vient d’un tir :
    SHOT_ON_TARGET est déjà compté
    GOAL ajoute seulement goals += 1

Sinon tu risques de compter deux tirs.

15. Réalisme des passes

À chaque possession, le moteur choisit une action.

Actions possibles :

SAFE_PASS
PROGRESSIVE_PASS
LONG_BALL
CROSS
DRIBBLE
SHOT
CLEARANCE
THROUGH_BALL
BACK_PASS

Probabilité de base selon zone :

Zone	Passe sûre	Passe progressive	Centre	Tir	Dribble
Défense	Haute	Moyenne	Nulle	Nulle	Faible
Milieu	Moyenne	Haute	Faible	Faible	Moyenne
Aile haute	Moyenne	Moyenne	Haute	Faible	Moyenne
Surface	Faible	Faible	Faible	Haute	Moyenne

Résolution d’une passe :

PassSuccess =
    0.72
  + passer.PassingScore * 0.003
  - pressure * 0.18
  - passDifficulty * 0.20
  + tacticSupport * 0.08
  + morale * 0.05
  - fatigue * 0.08

Clamp entre 0.45 et 0.96

Une équipe forte en possession aura donc naturellement :

plus de passes tentées
plus de passes réussies
moins de pertes rapides
plus de domination territoriale
16. Réalisme des tirs

Quand une action de tir est choisie :

xG =
    baseZoneXG
  + shooter.ShootingScore * 0.0015
  + assistQuality * 0.08
  - pressure * 0.12
  - defensiveDensity * 0.10
  + fastBreakBonus
  + setPieceModifier

Puis :

pOnTarget =
    0.28
  + shooter.ShootingScore * 0.003
  - pressure * 0.10
  - shotDifficulty * 0.12

pGoalIfOnTarget =
    xG / pOnTarget
  - goalkeeper.ShotStoppingScore * 0.0015

Résultat possible :

- But
- Arrêt du gardien
- Tir cadré repoussé en corner
- Tir non cadré
- Tir contré

Stats :

shots += 1
xG += xG
shotsOnTarget += 1 si cadré
shotsOffTarget += 1 si non cadré
blockedShots += 1 si contré
goals += 1 si but

Big chance :

if xG >= 0.25:
    bigChances += 1

if xG >= 0.25 and not goal:
    bigChancesMissed += 1
17. Réalisme des fautes et cartons

Les fautes doivent venir principalement des duels.

pFoul =
    0.04
  + duelIntensity * 0.08
  + defenderAggression * 0.06
  + defenderFatigue * 0.05
  - defenderDefensiveScore * 0.001
  + refereeSeverity * 0.04

Si faute :

cardSeverity =
    foulIntensity
  + tacticalFoulValue
  + dangerousness
  + repeatOffenderModifier
  + refereeSeverity

Décision :

if cardSeverity < 0.55:
    no card

if cardSeverity >= 0.55 and < 0.88:
    yellow card

if cardSeverity >= 0.88:
    red card

if playerAlreadyHasYellow and newYellow:
    red card by second yellow
18. Réalisme des blessures

Deux types :

CONTACT_INJURY
MUSCLE_INJURY

Blessure de contact :

pContactInjury =
    0.003
  + duelIntensity * 0.010
  + foulDangerousness * 0.015
  + playerFragility * 0.006

Blessure musculaire :

pMuscleInjury =
    0.001
  + fatigue * 0.008
  + recentLoad * 0.006
  + playerFragility * 0.008
  + sprintIntensity * 0.004

Gravité :

severityRoll = random()

if severityRoll < 0.70:
    LIGHT

else if severityRoll < 0.92:
    MEDIUM

else:
    SEVERE

Effets :

LIGHT:
    physiqueModifier -= 0.10 à 0.20
    peut continuer

MEDIUM:
    sortie recommandée ou forcée
    absence prochain match

SEVERE:
    sortie forcée
    absence plusieurs semaines

 19. Effet des tactiques

Chaque tactique doit modifier les probabilités.

4-3-3
+ largeur
+ pressing haut
+ centres
+ appels en profondeur
- espace derrière les latéraux
4-4-2
+ équilibre
+ duels
+ centres
+ présence dans la surface
- créativité axiale parfois plus faible
3-5-2
+ densité au milieu
+ contrôle axial
+ pistons importants
- fatigue des côtés
5-3-2
+ défense de surface
+ transitions directes
- possession
- nombre de tirs
3-4-3
+ attaque
+ largeur haute
+ pressing
- risque défensif

Exemple :

if formation == "4-3-3":
    wideAttackModifier += 0.12
    pressingModifier += 0.10
    counterAttackRiskAgainst += 0.08

if formation == "5-3-2":
    defensiveBoxModifier += 0.16
    attackVolumeModifier -= 0.10
    counterAttackModifier += 0.08
20. IA adverse

L’IA adverse évolue selon la division, passant d'un comportement d'initiation en D4 à une expertise de niveau "Génius" en D1.

#### Calcul du Score de Choix (AIChoiceScore)
L’IA adverse utilise le même système de choix que le joueur, mais automatiquement :
AIChoiceScore =
    winProbabilityImpact * 0.45
  + xGImpact * 0.25
  - injuryRisk * 0.10
  - redCardRisk * 0.10
  + coachPersonalityModifier * 0.10

#### Évolution par Division
- **D4 (Initiation) :** Choix quasi-aléatoires, peu de réaction aux événements, n'utilise pas de Tactiques Légendaires de manière optimale.
- **D3 (Optimisation) :** Commence à privilégier les options à haut xG et à gérer sa fatigue.
- **D2 (Maîtrise) :** Utilise les Tactiques Légendaires pour contrer les temps forts du joueur.
- **D1 (IA Génius) :** 
    - **Réactivité Totale :** L'IA analyse les changements du joueur. Si le joueur fait entrer un attaquant rapide, l'IA peut abaisser son bloc défensif ou demander à un défenseur d'être plus prudent.
    - **Timing Parfait :** Les Tactiques Légendaires sont déclenchées au moment où l'impact statistique est maximal (ex: "Mur d'Acier" juste après un changement offensif adverse ou lors d'un corner à la 90e).
    - **Synergies d'Élite :** L'IA bénéficie de bonus de synergie d'équipement similaires au joueur, rendant ses duels très difficiles à gagner sans un build optimisé.

#### Personnalités de Coach
Chaque coach possède une personnalité qui pondère ses choix :
- **CONSERVATIVE :** Privilégie le bloc bas et la protection du score.
- **AGGRESSIVE :** Pressing haut constant, quitte à s'exposer aux contres.
- **COUNTER_ATTACK :** Attend l'erreur pour lancer des transitions rapides.
- **POSSESSION :** Minimise les risques de perte de balle.
- **DIRECT_PLAY :** Cherche le jeu long et les seconds ballons.
21. Fin de match : génération des gains et XP

Après FinalizeMatch, tu peux calculer :

XP joueur =
    baseXP
  + minutesPlayed * xpPerMinute
  + goalBonus
  + assistBonus
  + cleanSheetBonus
  + goalkeeperSaveBonus
  + penaltySaveBonus
  + ratingBonus

Exemple :

baseXP = 5
xpPerMinute = 0.25

if player.scored:
    xp += 8

if player.scoredTwoOrMore:
    xp += 6

if goalkeeper.cleanSheet:
    xp += 10

if defender.cleanSheet and minutesPlayed >= 60:
    xp += 6

if goalkeeper.savedPenalty:
    xp += 12

Gain d’argent :

money =
    baseMatchReward
  * divisionMultiplier
  * competitionImportance
  * resultMultiplier

victory: 1.50
draw: 1.00
loss: 0.65
22. Tests automatiques indispensables

Pour valider le réalisme, fais tourner 10 000 matchs simulés sans UI.

Vérifie :

moyenne buts par match
moyenne tirs par équipe
moyenne tirs cadrés
moyenne corners
moyenne fautes
moyenne jaunes
fréquence rouges
fréquence blessures
possession moyenne selon niveau d’équipe
impact des formations
impact des cartons rouges
impact des remplacements

Exemple de test :

Une équipe 5 étoiles contre une équipe 2 étoiles doit :
- gagner plus souvent
- tirer plus souvent
- avoir plus de possession
- concéder moins d’occasions

Mais elle ne doit pas gagner 100 % des matchs.
23. Résumé de l’architecture à donner à Gemini

Tu peux transmettre cette consigne telle quelle à Gemini :

Implémente un moteur de simulation de match de football basé sur des possessions.

Le moteur doit :
1. Maintenir un MatchState déterministe avec seed.
2. Simuler le match comme une succession de possessions.
3. Choisir les actions par probabilités pondérées selon :
   - zone du terrain
   - tactique
   - stats effectives des joueurs
   - pression adverse
   - fatigue
   - moral
   - score
   - minute
4. Résoudre chaque action en générant des MatchEvent.
5. Mettre à jour les MatchStats uniquement à partir des MatchEvent.
6. Générer des événements secondaires :
   - faute
   - carton
   - blessure
   - corner
   - hors-jeu
   - penalty
   - coup franc
7. Déclencher un CoachChoice uniquement si l’importance de la situation dépasse un seuil.
8. Appliquer le choix du coach comme modificateur temporaire ou tactique.
9. Ne jamais modifier la simulation selon la vitesse d’affichage.
10. Permettre la reprise du match après chaque choix entraîneur.
11. Produire en fin de match :
   - score
   - buteurs
   - cartons
   - blessures
   - passes
   - tirs cadrés/non cadrés
   - xG
   - corners
   - fautes
   - hors-jeu
   - possession
   - XP joueurs
   - gains financiers
24. Recommandation MVP

Pour le MVP, je te conseille de commencer avec seulement ces événements interactifs :

1. Choix du tireur de penalty
2. Choix sur coup franc dangereux
3. Choix de routine de corner important
4. Choix de contre-attaque
5. Choix de dernière passe/tir
6. Joueur blessé : continuer ou remplacer
7. Joueur sous carton jaune : calmer ou remplacer
8. Carton rouge : réorganiser l’équipe
9. Fin de match : protéger le score ou attaquer

C’est suffisant pour donner au joueur le sentiment d’être entraîneur sans interrompre le match toutes les 20 secondes.

Le point le plus important : chaque choix doit modifier la simulation, pas seulement afficher un texte différent.
Un choix doit impacter au moins un de ces éléments :

- probabilité de tir
- xG potentiel
- risque de perte de balle
- risque de contre-attaque
- fatigue
- blessure
- carton
- moral
- possession
- comportement tactique

Voici une proposition de catalogue MVP de commentaires live pour ton simulateur de match. L’objectif est d’avoir assez de variété pour que le match paraisse vivant, sans devoir écrire des milliers de phrases dès le départ.

Le principe recommandé : chaque commentaire est une entrée localisée, déclenchée par un MatchEvent, avec des variables comme {player}, {team}, {opponent}, {minute}, {zone}, {assistPlayer}, {goalkeeper}.

Important pour ton projet Unity : les textes ci-dessous ne doivent pas être codés en dur. Ils doivent devenir des clés dans Unity Localization, par exemple :

Match.Commentary.Pass.Short.Completed.01
Match.Commentary.Shot.OnTarget.Save.03
Match.Commentary.Event.Penalty.ChoicePrompt.01
1. Structure recommandée d’un commentaire

Chaque commentaire peut être stocké comme ceci :

{
  "commentaryId": "PASS_SHORT_COMPLETED_01",
  "eventType": "PASS_COMPLETED",
  "intensity": "LOW",
  "tags": ["open_play", "pass", "short_pass"],
  "conditions": {
    "minMinute": 0,
    "maxMinute": 120,
    "requiredZoneType": "MIDFIELD",
    "teamMomentum": "ANY"
  },
  "localizationKey": "Match.Commentary.Pass.Short.Completed.01",
  "variables": ["player", "targetPlayer"]
}

Exemple de texte FR :

{player} joue simple vers {targetPlayer}.

Exemple EN :

{player} keeps it simple and finds {targetPlayer}.

Pour éviter la répétition, le moteur choisit une phrase parmi les commentaires compatibles avec l’événement.

2. Niveaux d’intensité

Je recommande 5 niveaux :

LOW        Action banale
MEDIUM     Action utile
HIGH       Action dangereuse
CRITICAL   Occasion majeure, but, carton rouge, blessure grave
TACTICAL   Message d’analyse tactique ou prompt entraîneur

L’UI peut utiliser ces niveaux pour afficher :

LOW        texte normal
MEDIUM     léger highlight
HIGH       icône/action importante
CRITICAL   animation, SFX supporter, vibration, gros encart
TACTICAL   pause ou suggestion entraîneur
3. Commentaires de début de match
Coup d’envoi
Le coup d’envoi est donné, {team} engage la rencontre.
C’est parti ! {team} lance ce match.
Le ballon roule, les deux équipes entrent immédiatement dans leur plan de jeu.
{team} donne le coup d’envoi sous les encouragements du public.
Début de match prudent, chacun cherche déjà ses repères.
Premières minutes
Les deux équipes s’observent dans ces premières minutes.
Le rythme est encore modéré, personne ne veut se découvrir trop vite.
{team} essaie de poser le pied sur le ballon.
{opponent} presse haut dès les premières secondes.
On sent que le milieu de terrain va être une zone clé aujourd’hui.
Match important
On sent de la tension autour de cette rencontre.
L’enjeu est important, les joueurs semblent particulièrement concentrés.
Le public pousse déjà, ce match peut compter lourd dans la saison.
Les deux équipes savent qu’un bon résultat aujourd’hui changerait beaucoup de choses.
4. Commentaires de possession calme
Conservation basse
{player} temporise dans sa moitié de terrain.
{team} repart tranquillement depuis l’arrière.
La défense de {team} fait circuler sans se précipiter.
{player} préfère assurer et remettre derrière.
{team} cherche une solution propre pour ressortir.

Conservation au milieu
{team} installe une longue séquence de possession.
{player} oriente le jeu au milieu.
Le ballon circule bien dans l’entrejeu.
{team} patiente et cherche l’ouverture.
{opponent} reste compact, il n’y a pas beaucoup d’espaces.
Possession stérile
{team} a le ballon, mais peine à progresser.
Beaucoup de passes, mais peu de danger pour l’instant.
{opponent} ferme bien les lignes de passe.
{team} tourne autour du bloc adverse.
La possession est propre, mais encore trop loin du but.
Domination territoriale
{team} commence à s’installer dans le camp adverse.
La pression monte autour de la surface de {opponent}.
{team} gagne du terrain possession après possession.
Le bloc de {opponent} recule de plus en plus.
{team} impose son rythme depuis quelques minutes.
5. Passes réussies
Passe courte simple
{player} trouve {targetPlayer} dans les pieds.
Passe courte assurée de {player}.
{player} joue simple et conserve le ballon.
{targetPlayer} reçoit tranquillement la passe de {player}.
{team} garde la maîtrise avec cette passe propre.
Passe progressive
Belle passe verticale de {player} vers {targetPlayer}.
{player} casse une ligne avec cette passe.
{targetPlayer} est trouvé entre les lignes.
Bonne progression de {team} grâce à {player}.
Cette passe de {player} fait avancer tout le bloc.
Passe latérale
{player} écarte le jeu sur le côté.
Le ballon voyage vers l’aile.
{team} cherche à étirer le bloc adverse.
{player} renverse calmement vers le couloir.
Le jeu bascule côté {side}.
Long ballon réussi
Long ballon précis de {player}.
{targetPlayer} contrôle bien cette ouverture.
{player} saute le milieu avec une belle passe longue.
Le ballon arrive dans la course de {targetPlayer}.
{team} choisit une option plus directe.
Passe clé
Superbe passe de {player}, {targetPlayer} peut attaquer la surface !
{player} vient de créer un vrai décalage.
Quelle inspiration de {player} !
{targetPlayer} est lancé dans une position intéressante.
La défense de {opponent} est prise dans son dos.
6. Passes ratées et interceptions
Passe ratée simple
La passe de {player} est trop imprécise.
{player} manque sa transmission.
Le ballon file directement vers un adversaire.
Mauvaise passe de {player}, {opponent} récupère.
{team} perd un ballon évitable.
Passe risquée interceptée
{player} tente une passe ambitieuse, mais c’est intercepté.
La défense de {opponent} avait bien lu l’intention.
Passe trop téléphonée de {player}.
{opponent} coupe la ligne de passe.
{team} voulait accélérer, mais perd le ballon.
Passe longue manquée
L’ouverture de {player} est trop profonde.
{targetPlayer} ne peut pas contrôler ce ballon.
Long ballon imprécis, possession rendue à {opponent}.
{player} cherchait vite la profondeur, mais c’est mal dosé.
Le ballon termine sa course hors des limites.
Mauvais choix sous pression
{player} était sous pression et perd le ballon.
Le pressing de {opponent} force l’erreur.
{player} n’a pas eu le temps de lever la tête.
{opponent} récupère haut, danger potentiel.
La sortie de balle de {team} est compliquée.

7. Dribbles et conduites de balle
Dribble réussi
{player} élimine son adversaire !
Beau crochet de {player}.
{player} fait la différence balle au pied.
Le défenseur est pris par le changement de rythme.
{player} gagne plusieurs mètres avec ce dribble.
Dribble raté
{player} tente le dribble, mais perd le ballon.
Le défenseur ne se laisse pas passer.
{player} en fait peut-être un peu trop.
Bonne intervention de {opponentPlayer} face à {player}.
{team} perd la possession après ce duel.
Percée dangereuse
{player} accélère plein axe !
{player} transperce le milieu adverse.
Ça s’ouvre devant {player}.
Belle conduite de balle, {team} approche de la surface.
{player} met la défense sous pression.
Conduite prudente
{player} porte le ballon et attend du soutien.
{player} temporise avant de choisir une option.
{team} avance progressivement.
{player} garde la maîtrise malgré la pression.
Le ballon reste dans les pieds de {team}.
8. Duels, tacles et récupérations
Duel gagné
{player} remporte son duel.
Gros impact de {player} dans ce duel.
{player} s’impose physiquement.
Bon duel gagné par {player}.
{team} récupère grâce à l’engagement de {player}.
Duel perdu
{player} perd son duel.
{opponentPlayer} prend le dessus physiquement.
{player} est battu dans l’impact.
{opponent} gagne un ballon important.
Le duel tourne à l’avantage de {opponent}.
Tacle réussi
Tacle propre de {player}.
{player} intervient parfaitement.
Excellent retour défensif de {player}.
{player} coupe l’action au bon moment.
Intervention autoritaire de {player}.
Tacle raté
{player} se jette, mais il est éliminé.
Le tacle de {player} est en retard.
{opponentPlayer} évite le contact et continue.
{player} manque son intervention.
La défense de {team} est maintenant déséquilibrée.
Interception
{player} anticipe parfaitement.
Interception précieuse de {player}.
{player} lit bien la passe adverse.
{team} récupère sans même aller au duel.
Très bonne lecture du jeu de {player}.
9. Pressing
Pressing réussi
Le pressing de {team} fonctionne !
{opponent} perd le ballon sous pression.
{player} force l’erreur adverse.
{team} récupère haut, la défense adverse est en difficulté.
Grosse intensité de {team} sur cette séquence.
Pressing contourné
{opponent} sort proprement du pressing.
Le pressing de {team} est évité.
{team} s’est livré, attention aux espaces.
{opponent} trouve une belle sortie de balle.
Le bloc de {team} doit vite se replacer.
Pressing coûteux
{team} presse fort, mais cela commence à peser physiquement.
Les joueurs de {team} multiplient les efforts.
Le pressing est intense, mais attention à la fatigue.
{player} semble déjà puiser dans ses réserves.
Cette stratégie demande beaucoup d’énergie.
10. Centres
Centre tenté
{player} centre dans la surface.
Le ballon est envoyé vers le point de penalty.
{player} cherche une tête dans la surface.
Centre de {player} depuis le côté {side}.
{team} met le ballon dans la boîte.
Centre réussi
Bon centre de {player} !
{targetPlayer} peut attaquer ce ballon.
Le centre trouve une zone dangereuse.
{player} dépose un ballon intéressant.
La défense de {opponent} est sous pression.
Centre raté
Le centre de {player} est trop long.
Centre directement capté par {goalkeeper}.
{player} manque son geste.
Le ballon traverse la surface sans trouver preneur.
Centre imprécis, {opponent} peut se dégager.
Centre contré
Le centre de {player} est contré.
Bon retour du défenseur pour empêcher le centre.
{player} obtient tout de même un corner.
Le ballon est dévié en touche.
{opponent} bloque bien le couloir.
11. Tirs
Tir lointain
{player} tente sa chance de loin !
Frappe lointaine de {player}.
{player} prend ses responsabilités.
La défense recule, {player} arme une frappe.
{player} cherche à surprendre le gardien.
Tir dans la surface
{player} frappe dans la surface !
Grosse opportunité pour {player}.
{player} se met en position de tir.
La défense laisse une fenêtre à {player}.
C’est une vraie occasion pour {team}.
Tir cadré
C’est cadré !
La frappe de {player} oblige {goalkeeper} à intervenir.
{player} trouve le cadre.
Bonne frappe de {player}, le gardien est sollicité.
Le ballon partait bien !
Tir non cadré
La frappe de {player} passe à côté.
Ce n’est pas cadré.
{player} manque le cadre de peu.
La tentative de {player} s’envole.
{player} avait une bonne position, mais la finition n’y est pas.
Tir contré
La frappe de {player} est contrée.
Un défenseur se sacrifie devant {player}.
{opponent} bloque la tentative.
Le tir ne passe pas le rideau défensif.
La défense de {opponent} tient bon.
Tir faible
Frappe trop molle de {player}.
{goalkeeper} capte sans difficulté.
La tentative manque de puissance.
{player} n’a pas réussi à appuyer sa frappe.
C’est trop facile pour le gardien.
Tir puissant
Quelle frappe puissante de {player} !
{player} déclenche une frappe lourde.
Le ballon part très vite !
{goalkeeper} doit rester vigilant.
La tentative de {player} était pleine de puissance.
12. Arrêts du gardien
Arrêt simple
{goalkeeper} capte tranquillement.
Arrêt sans difficulté pour {goalkeeper}.
{goalkeeper} se couche bien sur le ballon.
Le gardien de {team} rassure sa défense.
{goalkeeper} bloque cette tentative.
Bel arrêt
Bel arrêt de {goalkeeper} !
{goalkeeper} repousse le danger.
Superbe détente de {goalkeeper}.
{goalkeeper} sauve son équipe sur cette action.
Grosse intervention du gardien !
Arrêt exceptionnel
Quel arrêt incroyable de {goalkeeper} !
{goalkeeper} sort une parade décisive !
C’était presque dedans, mais {goalkeeper} dit non !
Parade énorme du gardien !
{goalkeeper} maintient son équipe dans le match.
Ballon repoussé
{goalkeeper} repousse dans l’axe !
Le ballon reste dangereux après l’arrêt.
{goalkeeper} ne peut que repousser.
Attention au second ballon !
La défense doit vite dégager.
Sortie aérienne
{goalkeeper} sort et capte le centre.
Bonne sortie aérienne de {goalkeeper}.
Le gardien s’impose dans les airs.
{goalkeeper} soulage sa défense.
Le ballon est capté dans la surface.
13. Buts
But simple
BUUUT pour {team} !
{player} ouvre le score !
{player} trouve le chemin des filets !
Le ballon est au fond !
{team} prend l’avantage grâce à {player}.
But après belle action collective
Quel mouvement collectif de {team} !
But magnifique après une superbe séquence de passes.
{player} conclut une action parfaitement construite.
{team} a fait tourner la défense avant de frapper.
C’est un but d’école pour {team}.
But sur contre-attaque
Contre-attaque fulgurante de {team}, et ça finit au fond !
{team} punit immédiatement la perte de balle adverse.
Transition parfaite, {player} conclut !
{opponent} était déséquilibré, {team} en profite.
But éclair de {team} !
But sur corner
But sur corner pour {team} !
{player} surgit dans la surface !
La défense de {opponent} est battue dans les airs.
Corner parfaitement exploité par {team}.
{player} coupe la trajectoire et marque !
But sur coup franc
But sur coup franc !
{player} enroule parfaitement sa frappe !
Le gardien ne peut rien faire !
Coup franc magistral de {player}.
{team} marque sur phase arrêtée !
But contre son camp
Oh non, c’est un but contre son camp !
Le ballon est dévié dans son propre but.
Situation terrible pour {opponentPlayer}.
{team} profite d’une déviation malheureuse.
Le gardien est pris à contrepied par son défenseur.
Égalisation
Égalisation de {team} !
{team} revient dans le match !
Tout est à refaire pour {opponent}.
{player} relance complètement la rencontre.
Le match bascule à nouveau.
But dans les dernières minutes
But énorme dans les dernières minutes !
{team} frappe au meilleur moment !
Le stade explose, {player} vient peut-être de décider du match.
Quelle fin de match !
{opponent} n’a presque plus de temps pour réagir.

14. Occasions franches et ratés
Occasion nette
Énorme occasion pour {team} !
{player} avait le but au bout du pied.
La défense de {opponent} était complètement ouverte.
C’était probablement la meilleure occasion du match.
{team} vient de passer tout près.
Face-à-face
{player} se présente face au gardien !
Duel direct entre {player} et {goalkeeper}.
{player} a une balle de but !
Tout le stade retient son souffle.
{goalkeeper} sort vite pour fermer l’angle.
Raté important
Quel raté de {player} !
{player} ne convertit pas cette énorme occasion.
Il fallait faire mieux sur cette situation.
{team} vient peut-être de laisser passer sa chance.
{player} s’en veut immédiatement.
Occasion manquée de peu
Ça passe juste à côté !
{player} était tout proche.
Le ballon frôle le poteau.
{team} n’était pas loin de marquer.
{opponent} peut souffler.
Poteau / barre
Poteau pour {team} !
La frappe de {player} s’écrase sur le montant !
La barre sauve {opponent} !
{goalkeeper} était battu, mais le cadre repousse le ballon.
Quelle occasion pour {team} !
15. Corners
Corner obtenu
Corner pour {team}.
Le centre est contré, ce sera un corner.
{team} obtient une phase arrêtée intéressante.
La pression continue avec ce corner.
{opponent} va devoir défendre sa surface.
Corner joué court
{team} choisit de jouer le corner à deux.
Corner court pour essayer de créer un décalage.
{player} ne centre pas tout de suite.
{team} préfère conserver plutôt que balancer dans la surface.
La défense de {opponent} doit sortir.
Corner direct dans la surface
Le corner est envoyé directement dans la surface.
{player} cherche la zone du point de penalty.
Ballon dangereux dans la boîte !
La défense de {opponent} est sous pression.
Tout le monde monte dans la surface.
Corner mal tiré
Corner mal dosé de {player}.
Le ballon ne passe pas le premier défenseur.
{opponent} se dégage facilement.
C’est une opportunité gâchée pour {team}.
{player} n’a pas trouvé la bonne zone.
Corner dangereux
Très bon corner de {player} !
Le ballon traîne dangereusement dans la surface.
{opponent} peine à se dégager.
Ça chauffe devant le but !
{team} gagne le premier duel aérien.
16. Coups francs
Coup franc obtenu
Coup franc pour {team}.
{player} obtient une faute intéressante.
L’arbitre siffle en faveur de {team}.
Bonne position de coup franc pour {team}.
{opponent} doit se replacer rapidement.
Coup franc dangereux
Coup franc très dangereux pour {team}.
La position est idéale pour un droitier ou un gaucher.
{player} semble vouloir le frapper directement.
Le mur se place, la tension monte.
C’est une vraie opportunité sur phase arrêtée.
Coup franc direct cadré
{player} frappe directement, c’est cadré !
Le coup franc oblige {goalkeeper} à intervenir.
Belle trajectoire de {player}.
{goalkeeper} reste vigilant sur sa ligne.
La frappe passe au-dessus du mur !
Coup franc direct raté
Le coup franc de {player} passe au-dessus.
{player} ne trouve pas le cadre.
La tentative manque de précision.
Le ballon s’envole dans les tribunes.
{team} pouvait espérer mieux.
Coup franc combiné
{team} tente une combinaison sur coup franc.
{player} décale intelligemment.
La défense de {opponent} est surprise.
Coup franc travaillé à l’entraînement.
{team} cherche autre chose qu’une frappe directe.
17. Penalties
Penalty obtenu
Penalty pour {team} !
L’arbitre désigne le point de penalty !
Grosse décision de l’arbitre !
{player} obtient un penalty.
{opponent} conteste, mais la décision est prise.
Avant tir
{player} pose le ballon sur le point de penalty.
Le stade retient son souffle.
Duel de nerfs entre {player} et {goalkeeper}.
{goalkeeper} tente de déstabiliser le tireur.
Moment capital dans ce match.
Penalty marqué
Penalty transformé par {player} !
{player} prend le gardien à contrepied !
C’est parfaitement tiré !
{team} marque sur penalty.
{goalkeeper} part du mauvais côté.
Penalty arrêté
{goalkeeper} arrête le penalty !
Parade énorme de {goalkeeper} !
{player} échoue face au gardien.
Le penalty est repoussé !
Moment décisif pour {opponent}.
Penalty raté
{player} manque le cadre !
Le penalty passe à côté !
Incroyable, {team} laisse passer une énorme occasion.
{player} n’a pas supporté la pression.
{opponent} peut souffler.
18. Hors-jeu
Hors-jeu simple
{player} est signalé hors-jeu.
Le drapeau se lève côté assistant.
L’appel de {player} était trop précoce.
{team} avait trouvé la profondeur, mais c’est annulé.
La défense de {opponent} a bien joué le coup.
Hors-jeu sur grosse occasion
Le but ne comptera pas, hors-jeu !
{player} avait marqué, mais il était parti trop tôt.
Quelle frustration pour {team}.
La défense de {opponent} est sauvée par le drapeau.
L’action était belle, mais irrégulière.
Ligne défensive efficace
{opponent} joue très bien la ligne.
Encore un appel piégé par la défense.
{team} doit mieux synchroniser ses courses.
La ligne défensive de {opponent} monte au bon moment.
{player} est pris par le piège du hors-jeu.
19. Fautes
Petite faute
Faute de {player}.
L’arbitre intervient pour calmer le jeu.
Contact irrégulier de {player}.
{opponentPlayer} obtient un coup franc.
Rien de méchant, mais faute logique.
Faute tactique
{player} coupe la contre-attaque.
Faute intelligente, mais risquée de {player}.
{team} stoppe l’action avant qu’elle ne devienne dangereuse.
L’arbitre rappelle {player} à l’ordre.
{opponent} voulait partir vite, mais l’action est stoppée.
Faute dangereuse
Grosse faute de {player}.
Le contact est limite.
{opponentPlayer} reste au sol après cette intervention.
L’arbitre va peut-être sortir un carton.
La tension monte après ce duel.
Avantage laissé
L’arbitre laisse l’avantage.
{opponent} continue malgré la faute.
Bonne décision de l’arbitre, l’action se poursuit.
{player} avait fait faute, mais le jeu continue.
{team} doit vite se replacer.
20. Cartons
Carton jaune
Carton jaune pour {player}.
{player} est averti.
L’arbitre sort le premier carton du match.
{player} devra faire attention maintenant.
Sanction logique après cette faute.
Deuxième jaune
Deuxième jaune pour {player}, c’est rouge !
{player} est exclu !
Terrible décision pour {team}.
{team} va finir le match en infériorité numérique.
{player} paie son excès d’engagement.
Carton rouge direct
Carton rouge direct pour {player} !
L’arbitre n’a pas hésité.
{team} se retrouve à dix !
C’est un tournant majeur dans ce match.
La faute était trop dangereuse.
Joueur averti sous pression
{player} est déjà averti, il doit être prudent.
Attention, {player} joue avec le feu.
{opponent} insiste dans la zone de {player}.
Le coach va peut-être devoir réagir.
{player} semble nerveux depuis son carton.
21. Blessures
Joueur touché
{player} reste au sol.
Le staff médical se prépare.
{player} semble avoir pris un mauvais coup.
Le jeu est interrompu quelques instants.
On surveille l’état de {player}.
Blessure légère
{player} peut continuer, mais il semble diminué.
Plus de peur que de mal pour {player}.
{player} reprend sa place, mais il grimace.
Le joueur va tenter de poursuivre.
Le staff indique que ça devrait aller.
Blessure moyenne
{player} ne semble pas pouvoir continuer normalement.
Le banc de {team} commence à s’agiter.
{player} boîte clairement.
Le coach doit probablement envisager un remplacement.
C’est un coup dur pour {team}.
Blessure grave
{player} ne pourra pas reprendre.
Grosse inquiétude autour de {player}.
Le staff demande immédiatement le changement.
C’est une blessure sérieuse pour {team}.
Le silence se fait dans le stade.
Retour après soins
{player} revient sur le terrain.
{team} retrouve ses onze joueurs.
{player} semble encore un peu gêné.
Le jeu reprend après cette interruption.
{player} va essayer de serrer les dents.
22. Remplacements
Remplacement normal
Changement pour {team} : {playerOut} cède sa place à {playerIn}.
{playerIn} entre en jeu.
{team} apporte du sang frais.
Le coach de {team} utilise un remplacement.
{playerOut} sort après avoir beaucoup donné.
Remplacement tactique
Changement tactique pour {team}.
{playerIn} entre pour modifier l’équilibre de l’équipe.
Le coach ajuste son système.
{team} semble vouloir changer d’approche.
Ce remplacement peut modifier la dynamique du match.
Remplacement sur blessure
{playerOut} ne peut pas continuer, {playerIn} le remplace.
Changement forcé pour {team}.
Blessure confirmée pour {playerOut}.
{team} doit revoir ses plans.
{playerIn} entre plus tôt que prévu.
Remplacement offensif
{team} fait entrer un profil plus offensif.
Le coach veut clairement aller chercher le résultat.
{playerIn} va apporter de la vitesse devant.
{team} prend plus de risques.
Le message est clair : il faut attaquer.
Remplacement défensif
{team} renforce son bloc défensif.
Le coach veut protéger le score.
{playerIn} entre pour stabiliser l’équipe.
{team} cherche à fermer les espaces.
Ce changement donne un signal prudent.
23. Changements tactiques
Passage offensif
{team} monte son bloc.
Le coach demande plus d’intensité offensive.
{team} prend davantage de risques.
Les latéraux de {team} jouent plus haut.
On sent que {team} veut forcer la décision.
Passage défensif
{team} resserre les lignes.
Le bloc de {team} descend d’un cran.
Le coach demande de la prudence.
{team} cherche maintenant à protéger le résultat.
Les espaces se réduisent dans le camp de {team}.
Pressing augmenté
{team} déclenche un pressing plus agressif.
Les joueurs de {team} montent très haut.
{opponent} a moins de temps pour relancer.
Le coach veut récupérer plus vite le ballon.
Le rythme monte nettement.
Ralentissement du tempo
{team} calme le jeu.
Le ballon circule plus lentement.
{team} cherche à contrôler le rythme.
Le coach demande de ne pas se précipiter.
Cette séquence permet à {team} de souffler.
Passage sur les ailes
{team} insiste maintenant sur les côtés.
Les couloirs deviennent la priorité.
{player} est souvent recherché sur son aile.
{opponent} doit coulisser davantage.
Le plan de jeu de {team} s’oriente vers la largeur.
24. Contre-attaques
Début de contre
{team} peut partir en contre !
Récupération intéressante de {team}.
{opponent} est déséquilibré.
Il y a de l’espace devant {team}.
Transition rapide possible !
Contre bien mené
{team} joue vite vers l’avant.
La contre-attaque est bien lancée.
{player} mène la transition.
{opponent} recule en catastrophe.
{team} exploite parfaitement l’espace.
Contre gâché
La contre-attaque est mal négociée.
{player} tarde trop à donner son ballon.
{opponent} a le temps de se replacer.
{team} avait une belle situation, mais la perd.
Mauvais choix dans la transition.
Contre dangereux
Gros danger sur cette contre-attaque !
{team} arrive en surnombre.
{opponent} est complètement ouvert.
{player} a plusieurs solutions devant lui.
Cette action peut faire très mal.
25. Phases de domination
Domination de l’équipe du joueur
{team} domine clairement depuis quelques minutes.
La possession est largement en faveur de {team}.
{opponent} subit de plus en plus.
{team} multiplie les attaques placées.
Le but semble se rapprocher pour {team}.
Domination adverse
{opponent} prend le contrôle du match.
{team} a du mal à ressortir.
La pression adverse devient inquiétante.
{team} subit une longue séquence défensive.
Le coach va peut-être devoir ajuster quelque chose.
Match équilibré
Les deux équipes se rendent coup pour coup.
Le match reste très équilibré.
Aucune équipe ne parvient vraiment à prendre le dessus.
Le duel tactique est intéressant.
Le score reflète assez bien la physionomie du match.
Momentum qui change
La dynamique semble tourner.
{team} reprend confiance.
{opponent} recule depuis quelques minutes.
Ce match est en train de changer de rythme.
On sent que quelque chose peut se passer.
26. Fatigue
Fatigue légère
{player} commence à montrer quelques signes de fatigue.
Les efforts répétés pèsent sur {player}.
{player} a moins de lucidité sur cette action.
La fin de match pourrait être difficile pour {player}.
{team} commence à perdre un peu d’intensité.
Fatigue collective
{team} semble moins tranchant physiquement.
Les espaces s’ouvrent avec la fatigue.
Le pressing de {team} perd en efficacité.
Les courses sont moins nombreuses qu’en début de match.
{team} doit gérer ses efforts.
Joueur cramé
{player} semble au bout physiquement.
{player} a du mal à répéter les efforts.
Le coach doit surveiller {player}.
{player} ne suit plus aussi bien les appels.
Le remplacement pourrait devenir nécessaire.
27. Moral et confiance
Joueur en confiance
{player} joue avec beaucoup de confiance.
On sent {player} libéré.
{player} tente davantage de choses.
La réussite donne des idées à {player}.
{player} semble porté par sa bonne performance.
Joueur nerveux
{player} semble nerveux.
{player} manque de sérénité dans ses choix.
Le dernier raté semble encore dans sa tête.
{player} doit vite se remettre dans le match.
La pression commence à peser sur {player}.
Équipe en confiance
{team} joue avec assurance.
Les joueurs de {team} se trouvent facilement.
Le collectif de {team} semble bien huilé.
{team} prend confiance au fil des minutes.
Tout paraît plus fluide côté {team}.
Équipe sous pression
{team} semble douter.
Les passes deviennent moins précises.
{team} recule dangereusement.
La pression adverse pèse mentalement.
Il faut que {team} retrouve de la maîtrise.
28. Fin de première mi-temps
Approche de la pause
On approche de la pause.
Les dernières minutes de cette première période peuvent compter.
{team} cherche à finir fort avant la mi-temps.
{opponent} veut rentrer au vestiaire sans concéder.
Le rythme baisse légèrement avant la pause.
Mi-temps
C’est la mi-temps.
L’arbitre renvoie les deux équipes aux vestiaires.
Première période terminée.
Il reste beaucoup à faire dans ce match.
Les coachs vont pouvoir ajuster leurs plans.
Mi-temps équipe mène
{team} rentre aux vestiaires avec l’avantage.
{opponent} devra réagir en seconde période.
Le score récompense la première période de {team}.
{team} a fait le travail, mais rien n’est terminé.
Le coach de {team} va devoir gérer cet avantage.
Mi-temps équipe menée
{team} est menée à la pause.
Il faudra montrer autre chose en seconde période.
{team} doit trouver des solutions offensives.
Le coach aura sûrement des choses à corriger.
{opponent} a pris une option, mais le match reste ouvert.

29. Début de seconde période
La seconde période commence.
{team} relance le jeu après la pause.
Les deux équipes reviennent avec de nouvelles intentions.
On va voir si les coachs ont ajusté leurs plans.
C’est reparti pour 45 minutes.
Reprise agressive
{team} revient avec beaucoup d’intensité.
Le discours de la mi-temps semble avoir porté ses fruits.
{team} presse plus haut dès la reprise.
{opponent} est immédiatement mis sous pression.
Le rythme repart très fort.
Reprise prudente
La reprise est plutôt calme.
Les deux équipes ne veulent pas se découvrir.
{team} reprend avec prudence.
Le ballon circule sans grande prise de risque.
Le match repart sur un rythme contrôlé.
30. Fin de match
Dernier quart d’heure
On entre dans le dernier quart d’heure.
Chaque possession peut devenir décisive.
La fatigue commence à peser.
Les choix du coach vont compter.
Le match entre dans sa phase critique.
Équipe mène
{team} cherche maintenant à gérer son avantage.
{opponent} pousse pour revenir.
{team} doit rester concentré jusqu’au bout.
Le bloc de {team} se resserre.
Les minutes semblent longues pour {team}.
Équipe perd
{team} doit prendre des risques maintenant.
Le temps presse pour {team}.
{team} pousse pour revenir au score.
Il faudra peut-être tenter quelque chose.
{opponent} défend de plus en plus bas.
Temps additionnel
Il y aura {addedMinutes} minutes de temps additionnel.
Le quatrième arbitre annonce {addedMinutes} minutes en plus.
Il reste encore du temps pour faire basculer ce match.
Tout peut encore arriver dans le temps additionnel.
{team} a encore quelques minutes pour agir.
Dernière action
Probablement la dernière occasion du match.
Tout le monde monte pour cette ultime action.
{team} joue son va-tout.
Le stade retient son souffle.
Derniers instants de la rencontre.
Coup de sifflet final
C’est terminé !
L’arbitre siffle la fin du match.
Fin de la rencontre.
Les joueurs peuvent souffler.
Le score est désormais définitif.
31. Prompts interactifs entraîneur

Ces commentaires doivent déclencher une pause ou un choix.

Choix sur penalty
Penalty pour {team}. Qui doit prendre ses responsabilités ?
Moment décisif : il faut choisir le tireur.
{team} obtient un penalty. Le choix du tireur peut changer le match.
Qui doit frapper ce penalty ?
Le banc attend votre décision pour le tireur.
Choix sur coup franc
Coup franc dangereux pour {team}. Quelle option choisir ?
La position est intéressante : tir direct ou combinaison ?
{team} peut créer le danger sur phase arrêtée.
Le mur est placé. Quelle routine utiliser ?
C’est une belle opportunité de coup franc.
Choix sur corner
Corner important pour {team}. Quelle routine demander ?
La défense adverse semble fragile sur les ballons aériens.
Faut-il jouer court ou envoyer directement dans la surface ?
Ce corner peut faire basculer le match.
Vos joueurs attendent la consigne sur ce corner.
Choix de contre-attaque
{team} peut partir en contre. Quelle décision prendre ?
Il y a de l’espace, mais le choix doit être rapide.
Contre-attaque prometteuse : jouer vite ou temporiser ?
{opponent} est désorganisé. Quelle option privilégier ?
C’est peut-être le moment d’accélérer.
Choix de dernière passe
{team} arrive aux abords de la surface. Quelle option choisir ?
La défense hésite : frapper, passer ou écarter ?
{player} a plusieurs solutions devant lui.
Situation dangereuse : il faut prendre la bonne décision.
Le choix de cette dernière passe peut être décisif.
Joueur blessé
{player} semble touché. Que faire ?
{player} peut continuer, mais le risque existe.
Le staff signale une gêne pour {player}.
Faut-il préserver {player} ou le laisser sur le terrain ?
Votre décision peut éviter une blessure plus grave.
Joueur sous carton jaune
{player} est averti et semble exposé. Quelle consigne donner ?
{opponent} insiste dans la zone de {player}.
Attention au deuxième carton pour {player}.
Faut-il calmer {player} ou le remplacer ?
Cette situation disciplinaire peut devenir dangereuse.
Carton rouge
{team} se retrouve à dix. Comment réorganiser l’équipe ?
Carton rouge : il faut immédiatement ajuster le système.
Votre équipe est en infériorité numérique.
Quel plan adopter après cette exclusion ?
La structure tactique doit être revue.
Fin de match
Le match entre dans les dernières minutes. Quelle stratégie adopter ?
Faut-il protéger le score ou continuer à attaquer ?
La fin de match demande une décision claire.
Votre équipe attend les consignes pour gérer les dernières minutes.
Le résultat peut dépendre de ce choix tactique.
32. Commentaires de fin de match et bilan
Victoire
Victoire de {team} !
{team} s’impose au terme d’un match maîtrisé.
Les joueurs de {team} peuvent célébrer.
Résultat important pour {team}.
Le plan de jeu a porté ses fruits.
Nul
Match nul entre les deux équipes.
Aucune équipe n’a réussi à faire la différence.
Un résultat partagé au terme d’un match disputé.
{team} repart avec un point.
Le score reflète un match équilibré.
Défaite
Défaite pour {team}.
{team} devra vite relever la tête.
Le résultat est frustrant pour {team}.
Il y aura des choses à corriger après ce match.
{opponent} repart avec la victoire.
Clean sheet
{team} termine sans encaisser de but.
Solide performance défensive de {team}.
Le gardien et la défense peuvent être satisfaits.
Clean sheet mérité pour {team}.
{opponent} n’a jamais trouvé la faille.
Match fou
Quel match spectaculaire !
Les supporters ont vécu une rencontre incroyable.
Ce match restera dans les mémoires.
Beaucoup d’occasions, beaucoup d’émotions.
Le scénario a été totalement renversant.
Match fermé
Match très fermé aujourd’hui.
Les défenses ont pris le dessus.
Peu d’espaces, peu d’occasions franches.
Les deux équipes se sont neutralisées.
Le spectacle offensif n’était pas au rendez-vous.
33. Format JSON complet recommandé pour Gemini

Voici une structure exploitable :

{
  "commentaryId": "SHOT_ON_TARGET_SAVE_01",
  "eventType": "SHOT_ON_TARGET",
  "priority": 80,
  "intensity": "HIGH",
  "cooldownGroup": "SHOT_SAVE",
  "minRepeatDelaySeconds": 600,
  "conditions": {
    "minXG": 0.12,
    "maxXG": 0.45,
    "requiresGoalkeeperSave": true,
    "excludedIfGoal": true
  },
  "localization": {
    "frKey": "Match.Commentary.Shot.OnTarget.Save.01",
    "enKey": "Match.Commentary.Shot.OnTarget.Save.01"
  },
  "variables": [
    "player",
    "goalkeeper",
    "team",
    "opponent"
  ],
  "sfx": "Crowd_Oh_Medium",
  "uiIcon": "ShotOnTarget"
}
34. Règles anti-répétition

Pour que le match ne donne pas l’impression de recycler les mêmes phrases :

1. Ne pas répéter le même commentaryId dans un match.
2. Ne pas répéter le même cooldownGroup pendant 5 à 10 minutes simulées.
3. Alterner commentaires courts et commentaires analytiques.
4. Réserver les commentaires longs aux événements importants.
5. Ajouter un commentaire tactique toutes les 5 à 8 minutes maximum.
6. Si aucun événement important ne survient, générer un commentaire de rythme ou de domination.

Exemple :

Minute 12 : "Le ballon circule bien dans l’entrejeu."
Minute 14 : "Belle passe verticale de Martin vers Lopez."
Minute 17 : "Le pressing de l’adversaire force l’erreur."
Minute 21 : "L’équipe a le ballon, mais peine à progresser."
35. Types de commentaires à générer automatiquement selon le rythme

Si le moteur détecte une période pauvre en événements, il doit produire des commentaires de contexte.

Match calme
Le rythme est retombé depuis quelques minutes.
Les deux équipes manquent de précision dans les derniers mètres.
Le match se joue beaucoup au milieu.
Peu d’espaces pour l’instant.
Les défenses contrôlent bien la situation.
Match intense
Le rythme est très élevé.
Les transitions s’enchaînent rapidement.
Les deux équipes jouent sans calcul.
Le match devient de plus en plus ouvert.
Les espaces apparaissent des deux côtés.
Beaucoup de fautes
Le match devient haché.
L’arbitre intervient de plus en plus souvent.
Les contacts se multiplient.
La tension monte entre les deux équipes.
Il va falloir garder son calme.

Beaucoup d’occasions
Les occasions commencent à s’accumuler.
Les gardiens sont très sollicités.
Les défenses souffrent depuis quelques minutes.
Le prochain but semble proche.
Le match peut basculer à tout moment.
36. Commentaires spéciaux selon formation
4-3-3
Les ailiers de {team} sont très impliqués.
{team} cherche souvent la largeur.
Le pressing haut de {team} gêne la relance adverse.
Les latéraux de {team} montent beaucoup.
{team} essaie d’étirer le bloc adverse.
4-4-2
{team} reste bien organisé en deux lignes.
Les deux attaquants de {team} travaillent ensemble.
{team} cherche rapidement ses joueurs de devant.
Le bloc de {team} est compact.
Les couloirs sont bien occupés par {team}.
4-3-3
{team} utilise bien ses ailiers.
Le jeu de {team} passe beaucoup par les côtés.
Les trois milieux offrent de bonnes solutions.
{team} presse haut avec ses trois attaquants.
Le système de {team} donne de la largeur.
3-5-2
Les pistons de {team} ont un rôle essentiel aujourd’hui.
{team} densifie bien le milieu.
Les deux attaquants de {team} restent proches.
{team} contrôle l’axe avec son milieu renforcé.
Attention à la fatigue des pistons de {team}.
5-3-2
{team} défend avec beaucoup de monde dans sa surface.
Le bloc de {team} est difficile à contourner.
{team} attend surtout les transitions.
Les espaces sont rares dans l’axe.
{opponent} doit trouver une solution face à ce bloc bas.
3-4-3
{team} met beaucoup de joueurs devant le ballon.
Le système de {team} est très offensif.
{opponent} peut trouver des espaces dans le dos.
Les transitions défensives seront importantes pour {team}.
{team} cherche à étouffer l’adversaire.
37. Catalogue MVP minimal à intégrer en priorité

Pour le MVP, je recommande de créer au moins :

20 commentaires de possession
30 commentaires de passes
20 commentaires de pertes de balle
20 commentaires de duels/tacles
20 commentaires de tirs
15 commentaires d’arrêts de gardien
20 commentaires de buts
15 commentaires de corners
15 commentaires de coups francs
10 commentaires de penalties
10 commentaires de hors-jeu
20 commentaires de fautes/cartons
15 commentaires de blessures
15 commentaires de remplacements
20 commentaires tactiques
20 commentaires de rythme/momentum
15 commentaires de fin de match

Soit environ 300 commentaires localisés FR/EN pour un MVP déjà très correct.

Tu peux ensuite enrichir progressivement avec :

- commentaires spécifiques par poste
- commentaires liés à la personnalité des joueurs
- commentaires liés à la rivalité
- commentaires liés à la météo
- commentaires liés à l’importance du match
- commentaires liés à la division ou à la coupe
38. Conseil d’implémentation

Le moteur ne doit pas choisir directement une phrase. Il doit produire un événement riche :

{
  "eventType": "SHOT_ON_TARGET",
  "minute": 64,
  "teamId": "HOME",
  "playerId": "P12",
  "goalkeeperId": "P01_AWAY",
  "zone": "BOX_CENTER",
  "xG": 0.34,
  "intensity": "HIGH",
  "tags": ["shot", "big_chance", "save"]
}

Puis le CommentaryService choisit la meilleure phrase compatible :

MatchEvent → CommentaryCandidates → Filters → AntiRepeat → Localization → UI

Cela respecte bien une architecture SOLID :

MatchSimulator
  produit les événements

StatsAccumulator
  calcule les stats

CommentaryService
  transforme les événements en texte

LocalizationService
  fournit FR/EN

MatchPresentation
  affiche à la bonne vitesse
39. Exemple de séquence live complète
03' Le ballon circule bien dans l’entrejeu.
05' Martin trouve Lopez entre les lignes.
07' Lopez tente d’accélérer, mais il perd son duel.
10' Le pressing de votre équipe force l’erreur adverse.
12' Durand frappe de loin ! Ce n’est pas cadré.
16' Votre équipe commence à s’installer dans le camp adverse.
19' Corner obtenu après un centre contré.
19' Le corner est envoyé directement dans la surface.
20' Bernard gagne son duel de la tête, mais ça passe au-dessus.
24' Attention, l’adversaire peut partir en contre !
25' Votre défense se replace bien et coupe l’action.
31' Faute de Morel au milieu du terrain.
34' Superbe passe verticale de Martin vers Lopez.
34' Lopez se présente face au gardien !
35' Bel arrêt du gardien adverse !
39' Votre équipe domine clairement depuis quelques minutes.
45' Il y aura 2 minutes de temps additionnel.
45+2' C’est la mi-temps.