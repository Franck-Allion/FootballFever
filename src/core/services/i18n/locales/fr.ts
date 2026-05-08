import type { Translations } from './Schema';

export const fr: Translations = {
    common: {
        press_start: 'APPUYER SUR START',
        current_state: 'État Actuel',
        prestige: 'Prestige',
        loading: 'Chargement...',
        error: 'Erreur',
        reset_boot: 'Réinitialiser vers BOOT',
        go_hub: 'Aller au HUB',
        attempt_match: 'Tenter MATCH (Garde AC)',
        initializing: 'Initialisation du moteur de match...',
        play_match: 'JOUER LE MATCH',
        simulating_match: 'SIMULATION DU MATCH...',
        sprite_position: 'Position du Sprite',
        persistence_recovered: 'La sauvegarde etait corrompue et a ete reinitialisee.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Gestion de l\'Équipe',
        toggle_phaser_scene: 'Basculer Scène Phaser',
        toggle_movement: 'Basculer Mouvement',
        add_fx_sprite: 'Ajouter Sprite FX'
    },
    match: {
        kickoff: "Coup d'envoi du match !",
        goal_home: "BUT pour l'équipe à domicile ! ({0}-{1})",
        goal_away: "BUT pour l'équipe à l'extérieur ! ({0}-{1})",
        shot_miss_home: "Tentative de l'équipe à domicile, c'est à côté !",
        shot_miss_away: "L'équipe à l'extérieur tente sa chance, mais le gardien s'interpose.",
        momentum_neutral: "Le ballon circule au milieu de terrain, les deux équipes s'observent.",
        half_time: "C'est la MI-TEMPS ! Les joueurs rejoignent les vestiaires.",
        full_time: "Fin du match ! Score final: {0}-{1}",
        resume_button: "Reprendre le match",
        exit_button: "Retour au Hub",
        live_sim: "SIMULATION LIVE",
        paused: "PAUSE",
        ht_overlay_title: "MI-TEMPS",
        ht_overlay_desc: "Les joueurs reprennent leur souffle. Êtes-vous prêt pour la seconde période ?",
        ft_overlay_title: "MATCH TERMINÉ",
        ft_overlay_desc: "Le coup de sifflet final a retenti. Consultez les statistiques de vos joueurs.",
        home_label: "DOMICILE",
        away_label: "EXTÉRIEUR"
    },
    debug: {
        console_title: 'Console Système',
        close_esc: 'FERMER [ESC]',
        run: 'EXECUTER',
        placeholder: 'Entrez une commande (ex: /add_prestige 1000)...'
    },
    settings: {
        lang_label: 'Langue :'
    },
    tactics: {
        squad: 'Effectif',
        goalkeepers: 'Gardiens',
        defenders: 'Défenseurs',
        midfielders: 'Milieux',
        attackers: 'Attaquants',
        formation_select: 'Choisir la tactique',
        instruction_select: 'Choisir la consigne',
        empty: 'VIDE',
        tab_resume: 'Résumé',
        tab_stats: 'Stats',
        tab_forme: 'Forme',
        back_hub: 'Retour au hub',
        instr_balanced_label: 'Équilibre',
        instr_high_press_label: 'Pressing Haut',
        instr_low_block_label: 'Bloc Bas',
        instr_wing_play_label: 'Jeu sur les Ailes',
        instr_direct_label: 'Transition Directe'
    }
};
