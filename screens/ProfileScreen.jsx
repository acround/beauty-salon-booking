
import React, { useState } from 'react';

const ProfileScreen = ({ t, user, setUser, onAdminLogin, privilegedUsers }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [adminKey, setAdminKey] = useState('');

    const handleSave = () => {
        setUser({ ...user, name, phone });
        alert('Changes saved!');
    };
    
    // The admin login section is only shown if the current user's Telegram username
    // is found in the list of users with Admin or Specialist roles.
    // TEMPORARY CHANGE: Set to true to allow easy access for development.
    const showAdminLogin = true;

    return (
        <div className="bg-gray-50 min-h-full">
            <header className="p-4 bg-brand-primary text-white sticky top-0 shadow-md">
                <h1 className="text-xl font-bold text-center">{t('profileTitle')}</h1>
            </header>
            <main className="p-6 space-y-6">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-brand-secondary mx-auto flex items-center justify-center text-4xl text-brand-primary font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{user.telegramUsername}</h2>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('yourName')}</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('phone')}</label>
                        <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    <button onClick={handleSave} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition">
                        {t('saveChanges')}
                    </button>
                </div>

                {showAdminLogin && (
                    <div className="pt-6 border-t">
                        <h3 className="text-lg font-semibold text-center">{t('adminPanel')}</h3>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">{t('adminPassword')}</label>
                            <div className="mt-1 flex space-x-2">
                                <input 
                                    type="password"
                                    placeholder={t('enterKeyword')}
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                />
                                <button onClick={() => onAdminLogin(adminKey)} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition">
                                    {t('login')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfileScreen;