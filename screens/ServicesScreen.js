
import React from 'react';

const ServicesScreen = ({ t, lt, services, specialists, onBook, onShowDetail }) => {
    
    // FIX: Explicitly type the accumulator for the reduce function to prevent type inference issues.
    const categories = services.reduce((acc, service) => {
        const categoryName = lt(service.category);
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(service);
        return acc;
    }, {});

    return (
        <div className="bg-gray-50">
            <header className="p-4 bg-brand-primary text-white sticky top-0 shadow-md">
                <h1 className="text-xl font-bold text-center">{t('servicesTitle')}</h1>
            </header>
            <main className="p-4 space-y-6">
                {Object.entries(categories).map(([category, servicesInCategory]) => (
                    <div key={category}>
                        <h2 className="text-lg font-semibold text-brand-text mb-3">{category}</h2>
                        <div className="space-y-4">
                            {servicesInCategory.map(service => (
                                <ServiceCard key={service.id} service={service} t={t} lt={lt} onBook={onBook} onShowDetail={onShowDetail} />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

const ServiceCard = ({ service, t, lt, onBook, onShowDetail }) => {
    const placeholderImage = 'https://via.placeholder.com/400x300.png?text=Beauty+Service';

    const handleBookClick = (e) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        onBook(service);
    };

    return (
        <div onClick={() => onShowDetail(service)} className="bg-white rounded-lg shadow-md overflow-hidden flex cursor-pointer hover:shadow-xl transition-shadow duration-200">
            <img src={service.image || placeholderImage} alt={lt(service.name)} className="w-1/3 h-auto object-cover" />
            <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                    <h3 className="font-bold text-brand-text">{lt(service.name)}</h3>
                    <p className="text-sm text-brand-text-light mt-1 line-clamp-2">{lt(service.description)}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-brand-primary font-semibold">
                        <p>{t('priceFrom', { price: service.price })}</p>
                        <p>{t('durationMinutes', { duration: service.duration })}</p>
                    </div>
                    <button onClick={handleBookClick} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-opacity-90 transition z-10">
                        {t('bookButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ServicesScreen;