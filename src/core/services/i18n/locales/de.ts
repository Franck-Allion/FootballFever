import type { Translations } from './Schema';

export const de: Translations = {
    common: {
        press_start: 'START DRÜCKEN',
        current_state: 'Aktueller Status',
        prestige: 'Prestige',
        loading: 'Laden...',
        error: 'Fehler',
        reset_boot: 'Zurück zu BOOT',
        go_hub: 'Zum HUB',
        attempt_match: 'Versuch MATCH',
        initializing: 'Match-Engine wird initialisiert...',
        play_match: 'MATCH SPIELEN',
        simulating_match: 'MATCH-SIMULATION...',
        sprite_position: 'Sprite-Position',
        persistence_recovered: 'Speicherstand war beschädigt und wurde zurückgesetzt.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Teammanagement',
        toggle_phaser_scene: 'Phaser-Szene umschalten',
        toggle_movement: 'Bewegung umschalten',
        add_fx_sprite: 'FX-Sprite hinzufügen'
    },
    match: {
        kickoff: "Anstoß!",
        goal_home: "TOR für die Heimmannschaft! ({0}-{1})",
        goal_away: "TOR für die Auswärtsmannschaft! ({0}-{1})",
        shot_miss_home: "Schussversuch Heimmannschaft, daneben!",
        shot_miss_away: "Auswärtsmannschaft versucht es, aber der Torwart hält.",
        momentum_neutral: "Der Ball zirkuliert im Mittelfeld, beide Teams beobachten sich.",
        half_time: "HALBZEIT! Die Spieler gehen in die Kabine.",
        full_time: "Abpfiff! Endstand: {0}-{1}",
        resume_button: "Spiel fortsetzen",
        exit_button: "Zurück zum Hub",
        live_sim: "LIVE SIMULATION",
        paused: "PAUSE",
        ht_overlay_title: "HALBZEIT",
        ht_overlay_desc: "Die Spieler atmen durch. Sind Sie bereit für die zweite Halbzeit?",
        ft_overlay_title: "MATCH BEENDET",
        ft_overlay_desc: "Der Schlusspfiff ist ertönt. Überprüfen Sie Ihre Spielerstatistiken.",
        home_label: "HEIM",
        away_label: "AUSWÄRTS"
    },
    debug: {
        console_title: 'Systemkonsole',
        close_esc: 'SCHLIESSEN [ESC]',
        run: 'AUSFÜHREN',
        placeholder: 'Befehl eingeben...'
    },
    settings: {
        lang_label: 'Sprache:'
    },
    tactics: {
        squad: 'Kader',
        goalkeepers: 'Torhüter',
        defenders: 'Verteidiger',
        midfielders: 'Mittelfeldspieler',
        attackers: 'Angreifer',
        formation_select: 'Taktik wählen',
        instruction_select: 'Anweisung wählen',
        empty: 'LEER',
        tab_resume: 'Übersicht',
        tab_stats: 'Stats',
        tab_forme: 'Form',
        back_hub: 'Zurück zum Hub',
        instr_balanced_label: 'Ausgeglichen',
        instr_high_press_label: 'Hohes Pressing',
        instr_low_block_label: 'Tiefes Abwehrbollwerk',
        instr_wing_play_label: 'Flügelspiel',
        instr_direct_label: 'Direkter Umschaltspiel'
    }
};
