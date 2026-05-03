import { LocaleSchema, type Translations } from './locales/Schema';

export type Language = 'en' | 'fr' | 'es' | 'de';

const STORAGE_KEY = 'football_fever_lang';
const DEFAULT_LANG: Language = 'en';

export class LocalizationService {
    private static instance: LocalizationService | null = null;
    private currentLanguage: Language = DEFAULT_LANG;
    private dictionary: Translations | null = null;
    private fallbackDictionary: Translations | null = null;
    private listeners: Array<(lang: Language) => void> = [];
    private isLoaded: boolean = false;

    private constructor() {}

    public static getInstance(): LocalizationService {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }
        return LocalizationService.instance;
    }

    public static resetInstanceForTests(): void {
        LocalizationService.instance = null;
    }

    public async init(): Promise<void> {
        if (this.isLoaded) return;

        let lang = this.detectLanguage();
        
        try {
            await this.loadFallback();
        } catch (e) {
            console.error('LocalizationService: Critical failure loading fallback language', e);
        }

        try {
            await this.loadLanguage(lang);
        } catch (e) {
            console.warn(`LocalizationService: Failed to load preferred language ${lang}, falling back to ${DEFAULT_LANG}`);
            lang = DEFAULT_LANG;
            this.dictionary = this.fallbackDictionary;
        }

        if (lang === DEFAULT_LANG) {
            this.fallbackDictionary = this.dictionary;
        }

        this.currentLanguage = lang;
        this.isLoaded = true;
    }

    public getLanguage(): Language {
        return this.currentLanguage;
    }

    public async setLanguage(lang: Language): Promise<void> {
        if (this.currentLanguage === lang) return;

        try {
            await this.loadLanguage(lang);
            this.currentLanguage = lang;

            try {
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {
                console.warn('LocalizationService: Failed to save language to localStorage', e);
            }

            this.notifyListeners();
        } catch (e) {
            console.error(`LocalizationService: Failed to switch to language ${lang}`, e);
            // State is not updated, keeping previous language
            throw e;
        }
    }

    /**
     * Translates a key path (e.g., 'common.press_start' or 'nested.deep.key')
     */
    public t(keyPath: string): string {
        if (!this.dictionary || !this.fallbackDictionary) {
            return keyPath;
        }

        const value = this.resolveKey(this.dictionary, keyPath);
        if (value !== undefined) return value;

        const fallbackValue = this.resolveKey(this.fallbackDictionary, keyPath);
        return fallbackValue ?? keyPath;
    }

    public subscribe(listener: (lang: Language) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private resolveKey(obj: any, path: string): string | undefined {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            // Prototype pollution guard
            if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, key)) {
                return undefined;
            }
            current = current[key];
        }

        return typeof current === 'string' ? current : undefined;
    }

    private async loadLanguage(lang: Language): Promise<void> {
        // Use explicit switch for brittle dynamic imports
        let module;
        switch (lang) {
            case 'fr': module = await import('./locales/fr.ts'); break;
            case 'es': module = await import('./locales/es.ts'); break;
            case 'de': module = await import('./locales/de.ts'); break;
            case 'en': 
            default: module = await import('./locales/en.ts'); break;
        }
        this.dictionary = LocaleSchema.parse(module[lang]);
    }

    private async loadFallback(): Promise<void> {
        const module = await import(`./locales/${DEFAULT_LANG}.ts`);
        this.fallbackDictionary = LocaleSchema.parse(module[DEFAULT_LANG]);
    }

    private detectLanguage(): Language {
        const validLanguages: Language[] = ['en', 'fr', 'es', 'de'];
        
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && validLanguages.includes(saved as Language)) {
                return saved as Language;
            }
        } catch (e) {
            // localStorage not available
        }

        const browserLang = navigator.language.split('-')[0] as Language;
        if (browserLang && validLanguages.includes(browserLang)) {
            return browserLang;
        }

        return DEFAULT_LANG;
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.currentLanguage);
            } catch (error) {
                console.error('LocalizationService: Listener notification failed', error);
            }
        });
    }
}
