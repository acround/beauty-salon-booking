import React from 'react';
import { Specialist, Service, LocalizedString } from '../types';

interface SpecialistsScreenProps {
    t: (key: any, options?: any) => string;
    lt: (localizedString: LocalizedString) => string;
    specialists: Specialist[];
    services: Service[];
    onBook: (service: Service, specialistId: string) => void;
}

const SpecialistsScreen: React.FC<SpecialistsScreenProps> = ({ t, lt, specialists, services, onBook }) => {
    return (
        <div className="bg-gray-50 min-h-full">
            <header className="p-4 bg-brand-primary text-white sticky top-0 shadow-md z-10">
                <h1 className="text-xl font-bold text-center">{t('specialistsTitle')}</h1>
            </header>
            <main className="p-4 space-y-6">
                {specialists.map(specialist => (
                    <SpecialistCard 
                        key={specialist.id} 
                        specialist={specialist} 
                        services={services} 
                        onBook={onBook} 
                        t={t} 
                        lt={lt}
                    />
                ))}
            </main>
        </div>
    );
};

const SpecialistCard: React.FC<{
    specialist: Specialist;
    services: Service[];
    onBook: (service: Service, specialistId: string) => void;
    t: (key: any, options?: any) => string;
    lt: (localizedString: LocalizedString) => string;
}> = ({ specialist, services, onBook, t, lt }) => {
    const specialistServices = services.filter(s => specialist.services.includes(s.id));

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex items-center space-x-4 bg-brand-secondary">
                <img src={specialist.avatar} alt={specialist.name} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
                <div>
                    <h2 className="text-lg font-bold text-brand-text">{specialist.name}</h2>
                    <p className="text-sm text-brand-text-light">{lt(specialist.bio)}</p>
                    <p className="text-sm font-semibold text-brand-primary mt-1">{specialist.rating.toFixed(1)} ★</p>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-brand-text mb-2">Services:</h3>
                <div className="space-y-3">
                    {specialistServices.length > 0 ? specialistServices.map(service => (
                        <div key={service.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                            <div>
                                <p className="font-semibold">{lt(service.name)}</p>
                                <p className="text-xs text-gray-500">{t('durationMinutes', { duration: service.duration })} - {t('priceFrom', { price: service.price })}</p>
                            </div>
                            <button 
                                onClick={() => onBook(service, specialist.id)} 
                                className="bg-brand-primary text-white font-semibold px-3 py-1 rounded-full text-sm hover:bg-opacity-90 transition"
                            >
                                {t('bookButton')}
                            </button>
                        </div>
                    )) : <p className="text-sm text-gray-500">No services assigned.</p>}
                </div>
            </div>
        </div>
    );
};

export default SpecialistsScreen;