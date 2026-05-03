import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalizationService } from './LocalizationService';

describe('LocalizationService', () => {
    let service: LocalizationService;

    beforeEach(() => {
        LocalizationService.resetInstanceForTests();
        localStorage.clear();
        service = LocalizationService.getInstance();
    });

    it('should default to English if no language is saved or detected', () => {
        expect(service.getLanguage()).toBe('en');
    });

    it('should return the correct translation for a given key', () => {
        expect(service.t('common.press_start')).toBe('PRESS START');
    });

    it('should switch language and return translated value', () => {
        service.setLanguage('fr');
        expect(service.getLanguage()).toBe('fr');
        expect(service.t('common.press_start')).toBe('APPUYER SUR START');
    });

    it('should fallback to English if a key is missing in the current language', () => {
        service.setLanguage('de');
        expect(service.t('common.press_start')).toBe('START DRUECKEN');
    });

    it('should return the key path if the key is not found in either current or fallback language', () => {
        expect(service.t('non.existent.key')).toBe('non.existent.key');
    });

    it('should notify listeners when language changes', () => {
        const listener = vi.fn();
        service.subscribe(listener);

        service.setLanguage('es');

        expect(listener).toHaveBeenCalledWith('es');
    });

    it('should persist language choice to localStorage', () => {
        service.setLanguage('fr');
        expect(localStorage.getItem('football_fever_lang')).toBe('fr');
    });

    it('should load saved language from localStorage on initialization', () => {
        localStorage.setItem('football_fever_lang', 'es');
        LocalizationService.resetInstanceForTests();
        const newService = LocalizationService.getInstance();
        expect(newService.getLanguage()).toBe('es');
    });

    it('should return the key path if it does not contain a dot', () => {
        expect(service.t('invalidkey')).toBe('invalidkey');
    });

    it('should return the key path if domain or key is missing after split', () => {
        expect(service.t('.')).toBe('.');
        expect(service.t('common.')).toBe('common.');
    });

    it('should detect browser language if no saved language exists', () => {
        localStorage.clear();
        LocalizationService.resetInstanceForTests();

        const originalLanguage = navigator.language;
        Object.defineProperty(navigator, 'language', {
            value: 'fr-FR',
            configurable: true
        });

        const newService = LocalizationService.getInstance();
        expect(newService.getLanguage()).toBe('fr');

        Object.defineProperty(navigator, 'language', {
            value: originalLanguage,
            configurable: true
        });
    });

    it('should fallback to key path if domain exists but key is missing in English', () => {
        expect(service.t('common.non_existent')).toBe('common.non_existent');
    });

    it('should unsubscribe successfully', () => {
        const listener = vi.fn();
        const unsubscribe = service.subscribe(listener);

        unsubscribe();
        service.setLanguage('fr');

        expect(listener).not.toHaveBeenCalled();
    });

    it('should return key path if domain does not exist', () => {
        expect(service.t('ghost.key')).toBe('ghost.key');
    });
});
