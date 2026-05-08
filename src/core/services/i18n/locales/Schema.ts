import { z } from 'zod';

export const LocaleSchema = z.object({
    common: z.object({
        press_start: z.string(),
        current_state: z.string(),
        prestige: z.string(),
        loading: z.string(),
        error: z.string(),
        reset_boot: z.string(),
        go_hub: z.string(),
        attempt_match: z.string(),
        initializing: z.string(),
        play_match: z.string(),
        simulating_match: z.string(),
        sprite_position: z.string(),
        persistence_recovered: z.string(),
        game_title: z.string()
    }),
    hub: z.object({
        team_management: z.string(),
        toggle_phaser_scene: z.string(),
        toggle_movement: z.string(),
        add_fx_sprite: z.string()
    }),
    match: z.object({
        kickoff: z.string(),
        goal_home: z.string(),
        goal_away: z.string(),
        shot_miss_home: z.string(),
        shot_miss_away: z.string(),
        momentum_neutral: z.string(),
        half_time: z.string(),
        full_time: z.string(),
        resume_button: z.string(),
        exit_button: z.string(),
        live_sim: z.string(),
        paused: z.string(),
        ht_overlay_title: z.string(),
        ht_overlay_desc: z.string(),
        ft_overlay_title: z.string(),
        ft_overlay_desc: z.string(),
        home_label: z.string(),
        away_label: z.string()
    }),
    debug: z.object({
        console_title: z.string(),
        close_esc: z.string(),
        run: z.string(),
        placeholder: z.string()
    }),
    settings: z.object({
        lang_label: z.string()
    }),
    tactics: z.object({
        squad: z.string(),
        goalkeepers: z.string(),
        defenders: z.string(),
        midfielders: z.string(),
        attackers: z.string(),
        formation_select: z.string(),
        instruction_select: z.string(),
        empty: z.string(),
        tab_resume: z.string(),
        tab_stats: z.string(),
        tab_forme: z.string(),
        back_hub: z.string(),
        instr_balanced_label: z.string(),
        instr_high_press_label: z.string(),
        instr_low_block_label: z.string(),
        instr_wing_play_label: z.string(),
        instr_direct_label: z.string()
    })
});

export type Translations = z.infer<typeof LocaleSchema>;
