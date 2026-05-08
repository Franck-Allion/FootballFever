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
        persistence_recovered: 'Save data was corrupt and has been reset.',
        game_title: 'FOOTBALL FEVER'
    },
    hub: {
        team_management: 'HUB - Team Management',
        toggle_phaser_scene: 'Toggle Phaser Scene',
        toggle_movement: 'Toggle Movement',
        add_fx_sprite: 'Add FX Sprite'
    },
    match: {
        kickoff: "Kickoff!",
        goal_home: "GOAL for the home team! ({0}-{1})",
        goal_away: "GOAL for the away team! ({0}-{1})",
        shot_miss_home: "Home team attempt, it's wide!",
        shot_miss_away: "Away team tries their luck, but the keeper saves it.",
        momentum_neutral: "The ball circulates in midfield, both teams are watching each other.",
        half_time: "It's HALF TIME! Players head to the lockers.",
        full_time: "Full time! Final score: {0}-{1}",
        resume_button: "Resume Match",
        exit_button: "Back to Hub",
        live_sim: "LIVE SIMULATION",
        paused: "PAUSED",
        ht_overlay_title: "HALF TIME",
        ht_overlay_desc: "Players are taking a breath. Are you ready for the second half?",
        ft_overlay_title: "MATCH FINISHED",
        ft_overlay_desc: "The final whistle has blown. Check your player statistics.",
        home_label: "HOME",
        away_label: "AWAY"
    },
    debug: {
        console_title: 'System Console',
        close_esc: 'CLOSE [ESC]',
        run: 'RUN',
        placeholder: 'Enter command (e.g. /add_prestige 1000)...'
    },
    settings: {
        lang_label: 'Lang:'
    },
    tactics: {
        squad: 'Squad',
        goalkeepers: 'Goalkeepers',
        defenders: 'Defenders',
        midfielders: 'Midfielders',
        attackers: 'Attackers',
        formation_select: 'Choose Formation',
        instruction_select: 'Choose Instruction',
        empty: 'EMPTY',
        tab_resume: 'Summary',
        tab_stats: 'Stats',
        tab_forme: 'Form',
        back_hub: 'Back to hub',
        instr_balanced_label: 'Balanced',
        instr_high_press_label: 'High Press',
        instr_low_block_label: 'Low Block',
        instr_wing_play_label: 'Wing Play',
        instr_direct_label: 'Direct Transition'
    }
};
