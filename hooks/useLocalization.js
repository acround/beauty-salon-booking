
import { useCallback } from 'react';
import { translations } from '../constants';

export const useLocalization = (language) => {
    const t = useCallback((key, options) => {
        let text = translations[key][language] || translations[key]['ru'];
        if (options) {
            Object.keys(options).forEach(optionKey => {
                text = text.replace(`{{${optionKey}}}`, String(options[optionKey]));
            });
        }
        return text;
    }, [language]);

    const lt = useCallback((localizedString) => {
        return localizedString[language] || localizedString['ru'];
    }, [language]);

    return { t, lt };
};