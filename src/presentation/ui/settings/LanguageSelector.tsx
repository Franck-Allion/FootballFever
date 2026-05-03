import { useTranslation } from '@ui/hooks/useTranslation';
import type { Language } from '@i18n/LocalizationService';

export function LanguageSelector() {
    const { t, language, setLanguage } = useTranslation();

    const languages: Array<{ code: Language; label: string }> = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'es', label: 'Español' },
        { code: 'de', label: 'Deutsch' }
    ];

    return (
        <div className="flex items-center gap-2 bg-gray-800 p-2 rounded shadow-inner">
            <span className="text-gray-400 text-xs font-bold uppercase">{t('settings.lang_label')}</span>
            <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-700 text-white text-sm rounded px-2 py-1 outline-none border border-gray-600 focus:border-blue-500"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
