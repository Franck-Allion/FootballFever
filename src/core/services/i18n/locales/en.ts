import type { Translations } from './Schema';

export const en: Translations = {
    common: {
        press_start: 'PRESS START',
        current_state: 'Current State',
        prestige: 'Prestige',
        loading: 'Loading...',
        error: 'Error',
        reset_boot: 'Reset to BOOT',
        go_hub: 'Go to HUB',
        attempt_match: 'Attempt MATCH (AC Guard)',
        initializing: 'Initializing match engine...',
        play_match: 'PLAY MATCH',
        simulating_match: 'SIMULATING MATCH...',
        sprite_position: 'Sprite Position',
        persistence_recovered: 'Save data was corrupted and has been reset to defaults.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Team Management',
        toggle_phaser_scene: 'Toggle Phaser Scene',
        toggle_movement: 'Toggle Movement',
        add_fx_sprite: 'Add FX Sprite'
    },
    debug: {
        console_title: 'System Console',
        close_esc: 'CLOSE [ESC]',
        run: 'RUN',
        placeholder: 'Enter command (e.g. /add_prestige 1000)...'
    },
    settings: {
        lang_label: 'Lang:'
    }
};
