import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalizationService } from './LocalizationService';

describe('LocalizationService', () => {
    let service: LocalizationService;

    beforeEach(async () => {
        LocalizationService.resetInstanceForTests();
        localStorage.clear();
        service = LocalizationService.getInstance();
        await service.init();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should default to English if no language is saved or detected', () => {
        expect(service.getLanguage()).toBe('en');
    });

    it('should return the correct translation for a given key', () => {
        expect(service.t('common.press_start')).toBe('PRESS START');
    });

    it('should switch language and return translated value', async () => {
        await service.setLanguage('fr');
        expect(service.getLanguage()).toBe('fr');
        expect(service.t('common.press_start')).toBe('APPUYER SUR START');
    });

    it('should fallback to English if a key is missing in the current language', async () => {
        await service.setLanguage('de');
        // Force a missing key to test fallback
        (service as any).dictionary.common.press_start = undefined;
        expect(service.t('common.press_start')).toBe('PRESS START');
    });

    it('should return the key path if the key is not found in either current or fallback language', () => {
        expect(service.t('non.existent.key')).toBe('non.existent.key');
    });

    it('should notify listeners when language changes', async () => {
        const listener = vi.fn();
        service.subscribe(listener);

        await service.setLanguage('es');

        expect(listener).toHaveBeenCalledWith('es');
    });

    it('should persist language choice to localStorage', async () => {
        await service.setLanguage('fr');
        expect(localStorage.getItem('football_fever_lang')).toBe('fr');
    });

    it('should load saved language from localStorage on initialization', async () => {
        localStorage.setItem('football_fever_lang', 'es');
        LocalizationService.resetInstanceForTests();
        const newService = LocalizationService.getInstance();
        await newService.init();
        expect(newService.getLanguage()).toBe('es');
    });

    it('should detect browser language if no saved language exists', async () => {
        localStorage.clear();
        LocalizationService.resetInstanceForTests();

        const originalLanguage = navigator.language;
        Object.defineProperty(navigator, 'language', {
            value: 'fr-FR',
            configurable: true
        });

        const newService = LocalizationService.getInstance();
        await newService.init();
        expect(newService.getLanguage()).toBe('fr');

        Object.defineProperty(navigator, 'language', {
            value: originalLanguage,
            configurable: true
        });
    });

    it('should unsubscribe successfully', async () => {
        const listener = vi.fn();
        const unsubscribe = service.subscribe(listener);

        unsubscribe();
        await service.setLanguage('fr');

        expect(listener).not.toHaveBeenCalled();
    });

    it('should handle nested keys', () => {
        // Our current locales only have 2 levels, but let's test the logic
        // We can manually inject a nested structure for testing if needed
        expect(service.t('debug.console_title')).toBe('System Console');
    });

    it('should guard against prototype pollution', () => {
        expect(service.t('common.toString')).toBe('common.toString');
        expect(service.t('constructor.name')).toBe('constructor.name');
    });

    it('should handle localStorage errors gracefully', async () => {
        // Ensure we are not already in 'de'
        if (service.getLanguage() === 'de') {
            await service.setLanguage('en');
        }

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // Mock localStorage.setItem directly
        const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('Quota exceeded');
        });

        await service.setLanguage('de');
        expect(service.getLanguage()).toBe('de');
        expect(consoleSpy).toHaveBeenCalled();
        
        setItemSpy.mockRestore();
    });

    it('should handle localStorage getter errors gracefully', async () => {
        LocalizationService.resetInstanceForTests();
        const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {     
            throw new Error('Denied');
        });
        const originalLanguage = navigator.language;
        Object.defineProperty(navigator, 'language', {
            value: 'fr-FR',
            configurable: true
        });
        
        const newService = LocalizationService.getInstance();
        await newService.init();
        expect(newService.getLanguage()).toBe('fr');
        
        getItemSpy.mockRestore();
        Object.defineProperty(navigator, 'language', {
            value: originalLanguage,
            configurable: true
        });
    });

    it('should handle listener errors without crashing', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        service.subscribe(() => { throw new Error('Crashed'); });
        const safeListener = vi.fn();
        service.subscribe(safeListener);

        await service.setLanguage('es');
        
        expect(safeListener).toHaveBeenCalledWith('es');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Listener notification failed'), expect.any(Error));
    });

    it('should return key if no dots in path', () => {
        expect(service.t('simplekey')).toBe('simplekey');
    });

    it('should handle invalid saved language by falling back to browser/default', async () => {
        localStorage.setItem('football_fever_lang', 'invalid');
        LocalizationService.resetInstanceForTests();
        const newService = LocalizationService.getInstance();
        await newService.init();
        // Since 'invalid' is not in validLanguages, it should skip it
        expect(newService.getLanguage()).toBe('en');
    });

    it('should skip initialization if already init', async () => {
        // First init happened in beforeEach
        const loadSpy = vi.spyOn(service as any, 'loadLanguage');
        await service.init();
        expect(loadSpy).not.toHaveBeenCalled();
    });
});
