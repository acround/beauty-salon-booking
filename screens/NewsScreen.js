

import React from 'react';
import { PublicationType } from '../types';

const NewsScreen = ({ t, lt, publications }) => {

    return (
        <div className="bg-gray-50 min-h-full">
            <header className="p-4 bg-brand-primary text-white sticky top-0 shadow-md">
                <h1 className="text-xl font-bold text-center">{t('newsTitle')}</h1>
            </header>
            <main className="p-4 space-y-4">
                {publications.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()).map(pub => (
                    <div key={pub.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src={pub.image} alt={lt(pub.title)} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            {pub.type === PublicationType.Promotion && (
                                <span className="inline-block bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-full uppercase mb-2">
                                    {t('promotion')}
                                </span>
                            )}
                            <h2 className="text-lg font-bold text-brand-text">{lt(pub.title)}</h2>
                            <p className="text-sm text-gray-500 mt-1 mb-2">
                                Published: {new Date(pub.publishDate).toLocaleDateString()}
                            </p>
                            <p className="text-brand-text-light">{lt(pub.content)}</p>
                            {pub.promoPeriod && (
                                <p className="text-xs text-brand-primary font-semibold mt-2">
                                    Valid: {new Date(pub.promoPeriod.start).toLocaleDateString()} - {new Date(pub.promoPeriod.end).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default NewsScreen;