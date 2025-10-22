
import React from 'react';

const LanguageSwitcher = ({ currentLanguage, setLanguage }) => {
    const languages = ['ru', 'en', 'sr'];

    return (
        <div className="absolute top-3 right-3 z-50 bg-black/10 backdrop-blur-sm p-1 rounded-full flex space-x-1">
            {languages.map(lang => (
                <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        currentLanguage === lang
                            ? 'bg-white text-brand-primary shadow-md'
                            : 'bg-transparent text-white/80 hover:bg-white/20'
                    }`}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;