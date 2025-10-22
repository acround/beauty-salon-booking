import React from 'react';
import { Service, Specialist, LocalizedString } from '../types';
import Icon from '../components/Icon';

interface ServiceDetailScreenProps {
    t: (key: any, options?: any) => string;
    lt: (localizedString: LocalizedString) => string;
    service: Service;
    specialists: Specialist[];
    onBook: () => void;
    onBack: () => void;
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({ t, lt, service, specialists, onBook, onBack }) => {
    const placeholderImage = 'https://via.placeholder.com/400x300.png?text=Beauty+Service';

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="p-4 bg-brand-primary text-white flex items-center sticky top-0 shadow-md z-10">
                <button onClick={onBack} className="mr-4">
                    <Icon name="chevronLeft"/>
                </button>
                <h1 className="text-xl font-bold truncate">{lt(service.name)}</h1>
            </header>
            
            <main className="flex-grow overflow-y-auto">
                <img src={service.image || placeholderImage} alt={lt(service.name)} className="w-full h-56 object-cover" />
                
                <div className="p-4">
                    <h2 className="text-2xl font-bold text-brand-text">{lt(service.name)}</h2>
                    <div className="flex items-center space-x-4 my-2 text-brand-text-light">
                        <span>{t('priceFrom', { price: service.price })}</span>
                        <span>|</span>
                        <span>{t('durationMinutes', { duration: service.duration })}</span>
                    </div>
                    <p className="text-brand-text-light mt-4">{lt(service.description)}</p>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-brand-text mb-3">{t('specialistsForService')}</h3>
                    <div className="space-y-3">
                        {specialists.map(specialist => (
                            <div key={specialist.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                                <img src={specialist.avatar} alt={specialist.name} className="w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-semibold">{specialist.name}</p>
                                    <p className="text-sm text-yellow-500">{specialist.rating.toFixed(1)} ★</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="p-4 bg-white border-t sticky bottom-0">
                <button 
                    onClick={onBook} 
                    className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-transform duration-200 ease-in-out transform hover:scale-105"
                >
                    {t('bookNow')}
                </button>
            </footer>
        </div>
    );
};

export default ServiceDetailScreen;