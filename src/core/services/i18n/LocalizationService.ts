import { en, type Translations } from '@i18n/locales/en';
import { fr } from '@i18n/locales/fr';
import { es } from '@i18n/locales/es';
import { de } from '@i18n/locales/de';

export type Language = 'en' | 'fr' | 'es' | 'de';

const STORAGE_KEY = 'football_fever_lang';

const locales: Record<Language, Translations> = {
    en,
    fr,
    es,
    de
};
const fallbackDictionary = locales.en as Record<string, Record<string, string>>;

export class LocalizationService {
    private static instance: LocalizationService | null = null;
    private currentLanguage: Language = 'en';
    private listeners: Array<(lang: Language) => void> = [];

    private constructor() {
        this.currentLanguage = this.detectLanguage();
    }

    public static getInstance(): LocalizationService {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }

        return LocalizationService.instance;
    }

    public static resetInstanceForTests(): void {
        LocalizationService.instance = null;
    }

    public getLanguage(): Language {
        return this.currentLanguage;
    }

    public setLanguage(lang: Language): void {
        if (this.currentLanguage === lang) return;

        this.currentLanguage = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        this.notifyListeners();
    }

    public t(keyPath: string): string {
        const [domain, key] = keyPath.split('.');
        
        if (!domain || !key) {
            return keyPath;
        }

        const dictionary = locales[this.currentLanguage] as Record<string, Record<string, string>>;
        const value = dictionary[domain]?.[key];

        if (value === undefined) {
            return fallbackDictionary[domain]?.[key] ?? keyPath;
        }

        return value;
    }

    public subscribe(listener: (lang: Language) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private detectLanguage(): Language {
        const saved = localStorage.getItem(STORAGE_KEY) as Language;
        if (saved && locales[saved]) {
            return saved;
        }

        const browserLang = navigator.language.split('-')[0] as Language;
        if (browserLang && locales[browserLang]) {
            return browserLang;
        }

        return 'en';
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentLanguage));
    }
}
