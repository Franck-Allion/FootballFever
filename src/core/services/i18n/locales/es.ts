import type { Translations } from './Schema';

export const es: Translations = {
    common: {
        press_start: 'PULSAR START',
        current_state: 'Estado Actual',
        prestige: 'Prestigio',
        loading: 'Cargando...',
        error: 'Error',
        reset_boot: 'Reiniciar a BOOT',
        go_hub: 'Ir al HUB',
        attempt_match: 'Intentar MATCH',
        initializing: 'Inicializando motor de partido...',
        play_match: 'JUGAR PARTIDO',
        simulating_match: 'SIMULACIÓN DEL PARTIDO...',
        sprite_position: 'Posición del Sprite',
        persistence_recovered: 'El guardado estaba corrupto y ha sido reiniciado.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Gestión del Equipo',
        toggle_phaser_scene: 'Cambiar Escena Phaser',
        toggle_movement: 'Cambiar Movimiento',
        add_fx_sprite: 'Añadir Sprite FX'
    },
    match: {
        kickoff: "¡Saque inicial!",
        goal_home: "¡GOL del equipo local! ({0}-{1})",
        goal_away: "¡GOL del equipo visitante! ({0}-{1})",
        shot_miss_home: "¡Intento del equipo local, se va fuera!",
        shot_miss_away: "El equipo visitante lo intenta, pero el portero interviene.",
        momentum_neutral: "El balón circula en el mediocampo, ambos equipos se observan.",
        half_time: "¡DESCANSO! Los jugadores se retiran a los vestuarios.",
        full_time: "¡Final del partido! Resultado final: {0}-{1}",
        resume_button: "Reanudar partido",
        exit_button: "Volver al Hub",
        live_sim: "SIMULACIÓN EN VIVO",
        paused: "PAUSA",
        ht_overlay_title: "DESCANSO",
        ht_overlay_desc: "Los jugadores se toman un respiro. ¿Estás listo para la segunda parte?",
        ft_overlay_title: "PARTIDO TERMINADO",
        ft_overlay_desc: "Ha sonado el pitido final. Consulta las estadísticas de tus jugadores.",
        home_label: "LOCAL",
        away_label: "VISITANTE"
    },
    debug: {
        console_title: 'Consola del Sistema',
        close_esc: 'CERRAR [ESC]',
        run: 'EJECUTAR',
        placeholder: 'Introducir comando...'
    },
    settings: {
        lang_label: 'Idioma:'
    }
};
