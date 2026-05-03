import type { Translations } from './Schema';

export const de: Translations = {
    common: {
        press_start: 'START DRUECKEN',
        current_state: 'Aktueller Status',
        prestige: 'Prestige',
        loading: 'Laden...',
        error: 'Fehler',
        reset_boot: 'Zurueck zu BOOT',
        go_hub: 'Gehe zum HUB',
        attempt_match: 'MATCH versuchen (AC Guard)',
        initializing: 'Match-Engine wird initialisiert...',
        play_match: 'MATCH SPIELEN',
        simulating_match: 'MATCH WIRD SIMULIERT...',
        sprite_position: 'Sprite-Position',
        persistence_recovered: 'Speicherdaten waren beschaedigt und wurden auf Standardwerte zurueckgesetzt.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Team-Management',
        toggle_phaser_scene: 'Phaser-Szene umschalten',
        toggle_movement: 'Bewegung umschalten',
        add_fx_sprite: 'FX-Sprite hinzufuegen'
    },
    debug: {
        console_title: 'Systemkonsole',
        close_esc: 'SCHLIESSEN [ESC]',
        run: 'AUSFUEHREN',
        placeholder: 'Befehl eingeben (z.B. /add_prestige 1000)...'
    },
    settings: {
        lang_label: 'Sprache:'
    }
};
