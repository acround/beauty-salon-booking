
import React from 'react';
import Icon from './Icon.jsx';

const NavItem = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'text-brand-primary' : 'text-gray-400';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-1/5 pt-2 pb-1 ${activeClass} transition-colors duration-200`}>
            <Icon name={icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

const BottomNav = ({ currentView, setCurrentView, t }) => {
    return (
        <div className="flex justify-around items-center bg-white border-t border-gray-200 shadow-inner">
            <NavItem 
                icon="services" 
                label={t('navServices')}
                isActive={currentView === 'services'}
                onClick={() => setCurrentView('services')}
            />
            <NavItem 
                icon="bookings" 
                label={t('navBookings')}
                isActive={currentView === 'bookings'}
                onClick={() => setCurrentView('bookings')}
            />
            <NavItem 
                icon="news" 
                label={t('navNews')}
                isActive={currentView === 'news'}
                onClick={() => setCurrentView('news')}
            />
            <NavItem 
                icon="specialists" 
                label={t('navSpecialists')}
                isActive={currentView === 'specialists'}
                onClick={() => setCurrentView('specialists')}
            />
            <NavItem 
                icon="profile" 
                label={t('navProfile')}
                isActive={currentView === 'profile'}
                onClick={() => setCurrentView('profile')}
            />
        </div>
    );
};

export default BottomNav;