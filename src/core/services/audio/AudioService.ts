import { LoggerService, LogDomain } from '../logger/LoggerService';

export type AudioDomain = 'ui' | 'match' | 'amb' | 'music';

/**
 * AAA Asset Naming Convention: <domain>_<action>_<variation>
 * Example: ui_tactics_place_01
 */
export interface SoundEvent {
    id: string;
    domain: AudioDomain;
    path: string;
}

const SOUND_REGISTRY: SoundEvent[] = [
    { id: 'ui_tactics_pickup_01', domain: 'ui', path: '/assets/sfx/ui_tactics_pickup_01.mp3' },
    { id: 'ui_tactics_place_01', domain: 'ui', path: '/assets/sfx/ui_tactics_place_01.mp3' },
    { id: 'ui_tactics_swap_01', domain: 'ui', path: '/assets/sfx/ui_tactics_swap_01.mp3' },
];

export class AudioService {
    private static instance: AudioService | null = null;
    private context: AudioContext | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private loadingPromises: Map<string, Promise<AudioBuffer>> = new Map();
    private globalVolume: number = 0.7;
    private masterGain: GainNode | null = null;
    private logger = LoggerService.getInstance();

    private constructor() {}

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    public static resetInstanceForTests(): void {
        AudioService.instance = null;
    }

    /**
     * Unlocks the AudioContext. Must be called after a user interaction.
     */
    public async unlock(): Promise<void> {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (!this.masterGain && this.context) {
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.globalVolume;
            this.masterGain.connect(this.context.destination);
        }

        if (this.context?.state === 'suspended') {
            await this.context.resume();
        }
    }

    /**
     * Preloads an audio asset into the cache.
     */
    public async preload(eventId: string): Promise<void> {
        await this.loadBuffer(eventId);
    }

    /**
     * Plays a sound by its logical ID.
     */
    public async play(eventId: string): Promise<void> {
        try {
            // Auto-unlock if context exists but is suspended (still needs initial unlock via user gesture)
            if (this.context?.state === 'suspended') {
                await this.context.resume();
            }

            const buffer = await this.loadBuffer(eventId);
            if (!buffer) return;

            if (!this.context || !this.masterGain) return;

            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.masterGain);
            source.start(0);
        } catch (error) {
            this.logger.error(`AudioService: Failed to play sound ${eventId}`, error, LogDomain.CORE);
        }
    }

    /**
     * Sets the global SFX volume (0.0 to 1.0).
     */
    public setVolume(volume: number): void {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.globalVolume, this.context!.currentTime, 0.1);
        }
    }

    private async loadBuffer(eventId: string): Promise<AudioBuffer | null> {
        if (this.buffers.has(eventId)) {
            return this.buffers.get(eventId)!;
        }

        if (this.loadingPromises.has(eventId)) {
            return this.loadingPromises.get(eventId)!;
        }

        const event = SOUND_REGISTRY.find(s => s.id === eventId);
        if (!event) {
            this.logger.warn(`AudioService: Sound event ${eventId} not found in registry`, undefined, LogDomain.CORE);
            return null;
        }

        this.logger.info(`AudioService: Fetching asset from ${event.path}`, undefined, LogDomain.CORE);
        const loadPromise = (async () => {
            try {
                const response = await fetch(event.path);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                
                // We need the context to decode
                if (!this.context) {
                    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
                }

                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                this.buffers.set(eventId, audioBuffer);
                this.logger.info(`AudioService: Successfully loaded and decoded ${eventId}`, undefined, LogDomain.CORE);
                return audioBuffer;
            } catch (error) {
                this.logger.error(`AudioService: Failed to load asset ${event.path}`, error, LogDomain.CORE);
                return null;
            } finally {
                this.loadingPromises.delete(eventId);
            }
        })();

        this.loadingPromises.set(eventId, loadPromise);
        return loadPromise;
    }
}
