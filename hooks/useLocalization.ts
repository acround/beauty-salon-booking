
import { useCallback } from 'react';
import { Language, LocalizedString } from '../types';
import { translations } from '../constants';

export const useLocalization = (language: Language) => {
    const t = useCallback((key: keyof typeof translations, options?: Record<string, string | number>) => {
        let text = translations[key][language] || translations[key]['ru'];
        if (options) {
            Object.keys(options).forEach(optionKey => {
                text = text.replace(`{{${optionKey}}}`, String(options[optionKey]));
            });
        }
        return text;
    }, [language]);

    const lt = useCallback((localizedString: LocalizedString) => {
        return localizedString[language] || localizedString['ru'];
    }, [language]);

    return { t, lt };
};
