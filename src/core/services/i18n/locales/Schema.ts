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
    debug: z.object({
        console_title: z.string(),
        close_esc: z.string(),
        run: z.string(),
        placeholder: z.string()
    }),
    settings: z.object({
        lang_label: z.string()
    })
});

export type Translations = z.infer<typeof LocaleSchema>;
