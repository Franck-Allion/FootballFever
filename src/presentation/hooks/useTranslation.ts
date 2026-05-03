import { useState, useEffect } from 'react';
import { LocalizationService, type Language } from '@i18n/LocalizationService';

export function useTranslation() {
    const service = LocalizationService.getInstance();
    const [lang, setLang] = useState<Language>(service.getLanguage());

    useEffect(() => {
        const unsubscribe = service.subscribe((newLang) => {
            setLang(newLang);
        });

        return unsubscribe;
    }, [service]);

    return {
        t: (key: string) => service.t(key),
        language: lang,
        setLanguage: (newLang: Language) => service.setLanguage(newLang)
    };
}
