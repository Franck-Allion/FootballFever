import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AudioService } from './AudioService';

describe('AudioService', () => {
    beforeEach(() => {
        AudioService.resetInstanceForTests();
        
        // Mock global fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
        });

        // Mock AudioContext globally
        const mockAudioContext = vi.fn().mockImplementation(() => ({
            createGain: () => ({
                connect: vi.fn(),
                gain: { value: 1, setTargetAtTime: vi.fn() }
            }),
            decodeAudioData: (data: any) => Promise.resolve({ duration: 1 }),
            createBufferSource: () => ({
                buffer: null,
                connect: vi.fn(),
                start: vi.fn()
            }),
            resume: vi.fn().mockResolvedValue(undefined),
            destination: {},
            currentTime: 0,
            state: 'running'
        }));

        (window as any).AudioContext = mockAudioContext;
        (window as any).webkitAudioContext = mockAudioContext;
    });

    it('is a singleton', () => {
        const instance1 = AudioService.getInstance();
        const instance2 = AudioService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('preloads an asset correctly', async () => {
        const service = AudioService.getInstance();
        await service.preload('ui_tactics_place_01');
        
        // Fetch should have been called
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('ui_tactics_place_01.mp3'));
    });

    it('unlocks the AudioContext', async () => {
        const service = AudioService.getInstance();
        await service.unlock();
        
        const instance = (service as any);
        expect(instance.context).toBeDefined();
        expect(instance.masterGain).toBeDefined();
    });

    it('sets the volume correctly', async () => {
        const service = AudioService.getInstance();
        await service.unlock(); // Ensure gain node exists
        
        const instance = (service as any);
        const setTargetAtTimeSpy = instance.masterGain.gain.setTargetAtTime;
        
        service.setVolume(0.5);
        expect(instance.globalVolume).toBe(0.5);
        expect(setTargetAtTimeSpy).toHaveBeenCalledWith(0.5, expect.any(Number), 0.1);
    });

    it('plays a sound correctly', async () => {
        const service = AudioService.getInstance();
        await service.unlock(); // Initialize context
        
        const instance = (service as any);
        
        // Mock createBufferSource on the actual context instance
        const mockSource = {
            buffer: null,
            connect: vi.fn(),
            start: vi.fn()
        };
        instance.context.createBufferSource = vi.fn().mockReturnValue(mockSource);
        
        await service.play('ui_tactics_place_01');
        
        expect(mockSource.start).toHaveBeenCalledWith(0);
    });

    it('resumes a suspended context when playing', async () => {
        const service = AudioService.getInstance();
        await service.unlock();
        
        const instance = (service as any);
        instance.context.state = 'suspended';
        const resumeSpy = instance.context.resume;
        
        // Mock createBufferSource to avoid more errors
        instance.context.createBufferSource = vi.fn().mockReturnValue({
            connect: vi.fn(),
            start: vi.fn()
        });

        await service.play('ui_tactics_place_01');
        expect(resumeSpy).toHaveBeenCalled();
    });

    it('falls back to webkitAudioContext if AudioContext is missing', async () => {
        const originalAudioContext = window.AudioContext;
        (window as any).AudioContext = undefined;
        (window as any).webkitAudioContext = vi.fn().mockImplementation(() => ({
            createGain: () => ({ connect: vi.fn(), gain: { value: 1, setTargetAtTime: vi.fn() } }),
            destination: {}
        }));

        const service = AudioService.getInstance();
        await service.unlock();
        
        expect((window as any).webkitAudioContext).toHaveBeenCalled();
        
        // Restore
        window.AudioContext = originalAudioContext;
    });

    it('creates context early in loadBuffer if not yet unlocked', async () => {
        const service = AudioService.getInstance();
        // Do NOT call unlock()
        
        await service.preload('ui_tactics_place_01');
        const instance = (service as any);
        expect(instance.context).toBeDefined();
    });

    it('returns early in play if buffer is missing', async () => {
        const service = AudioService.getInstance();
        await service.unlock();
        
        // Mock loadBuffer to return null
        (service as any).loadBuffer = vi.fn().mockResolvedValue(null);
        
        await expect(service.play('ui_tactics_place_01')).resolves.not.toThrow();
    });

    it('unlocks and resumes a suspended context', async () => {
        const service = AudioService.getInstance();
        (window as any).AudioContext = vi.fn().mockImplementation(() => ({
            createGain: () => ({ connect: vi.fn(), gain: { value: 1, setTargetAtTime: vi.fn() } }),
            destination: {},
            state: 'suspended',
            resume: vi.fn().mockResolvedValue(undefined)
        }));
        
        await service.unlock();
        const instance = (service as any);
        expect(instance.context.resume).toHaveBeenCalled();
    });

    it('returns early in play if context or masterGain is missing', async () => {
        const service = AudioService.getInstance();
        // Do NOT call unlock() or play anything yet
        
        await service.play('ui_tactics_place_01');
        const instance = (service as any);
        expect(instance.context).toBeDefined(); // loadBuffer creates it
        expect(instance.masterGain).toBeNull();
    });

    it('handles non-existent sound events in loadBuffer', async () => {
        const service = AudioService.getInstance();
        const result = await (service as any).loadBuffer('invalid_id');
        expect(result).toBeNull();
    });

    it('throws error if fetch response is not ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404
        });
        const service = AudioService.getInstance();
        const result = await (service as any).loadBuffer('ui_tactics_place_01');
        expect(result).toBeNull();
    });
});
