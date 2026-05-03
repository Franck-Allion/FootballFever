import type { Translations } from './Schema';

export const es: Translations = {
    common: {
        press_start: 'PRESIONAR START',
        current_state: 'Estado Actual',
        prestige: 'Prestigio',
        loading: 'Cargando...',
        error: 'Error',
        reset_boot: 'Reiniciar a BOOT',
        go_hub: 'Ir al HUB',
        attempt_match: 'Intentar PARTIDO (Guardia AC)',
        initializing: 'Inicializando motor de partido...',
        play_match: 'JUGAR PARTIDO',
        simulating_match: 'SIMULANDO PARTIDO...',
        sprite_position: 'Posicion del Sprite',
        persistence_recovered: 'Los datos guardados estaban corruptos y se restablecieron.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Gestion de Equipo',
        toggle_phaser_scene: 'Alternar Escena Phaser',
        toggle_movement: 'Alternar Movimiento',
        add_fx_sprite: 'Anadir Sprite FX'
    },
    debug: {
        console_title: 'Consola del Sistema',
        close_esc: 'CERRAR [ESC]',
        run: 'EJECUTAR',
        placeholder: 'Ingrese comando (ej. /add_prestige 1000)...'
    },
    settings: {
        lang_label: 'Idioma:'
    }
};
