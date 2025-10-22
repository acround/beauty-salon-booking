
import React, { useState, useMemo } from 'react';
import { Role, ScheduleChangeRequestStatus } from './types';
import { useLocalization } from './hooks/useLocalization';
import AdminScreen from './screens/AdminScreen.jsx';
import ServicesScreen from './screens/ServicesScreen.jsx';
import MyBookingsScreen from './screens/MyBookingsScreen.jsx';
import NewsScreen from './screens/NewsScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import SpecialistsScreen from './screens/SpecialistsScreen.jsx';
import { mockServices, mockSpecialists, mockBookings, mockNews, mockUsers, mockScheduleChangeRequests } from './data/mockData';
import BottomNav from './components/BottomNav.jsx';
import BookingFlow from './screens/BookingFlow.jsx';
import ServiceDetailScreen from './screens/ServiceDetailScreen.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';

const App = () => {
    const [language, setLanguage] = useState('ru');
    const { t, lt } = useLocalization(language);

    // --- State Management (Simulating Database) ---
    const [services, setServices] = useState(mockServices);
    const [specialists, setSpecialists] = useState(mockSpecialists);
    const [bookings, setBookings] = useState(mockBookings);
    const [news, setNews] = useState(mockNews);
    const [users, setUsers] = useState(mockUsers);
    const [scheduleRequests, setScheduleRequests] = useState(mockScheduleChangeRequests);
    
    const [currentUser, setCurrentUser] = useState(users[0]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentView, setCurrentView] = useState('services');

    const [bookingState, setBookingState] = useState({service: null, specialistId: null});
    const [selectedService, setSelectedService] = useState(null);

    const privilegedUsers = useMemo(() => users.filter(u => u.role !== Role.User), [users]);

    const handleLogin = (key) => {
        if (key === 'admin_pass') {
            const adminUser = users.find(u => u.role === Role.Admin);
            if (adminUser) {
                setCurrentUser(adminUser);
                setIsAdmin(true);
                setCurrentView('admin');
            }
        } else {
            const specialist = specialists.find(s => s.accessKey === key);
            if (specialist) {
                const specUser = users.find(u => u.specialistId === specialist.id);
                if(specUser) {
                    setCurrentUser(specUser);
                    setIsAdmin(true);
                    setCurrentView('admin');
                }
            }
        }
    };
    
    const handleLogout = () => {
        setIsAdmin(false);
        setCurrentUser(users[0]);
        setCurrentView('services');
    };

    const startBooking = (service, specialistId) => {
        setBookingState({ service, specialistId: specialistId || null });
        setCurrentView('bookingFlow');
    };

    const exitBookingFlow = () => {
        setBookingState({ service: null, specialistId: null });
        setCurrentView('services');
    };
    
    const showServiceDetail = (service) => {
        setSelectedService(service);
        setCurrentView('serviceDetail');
    };
    
    const exitServiceDetail = () => {
        setSelectedService(null);
        setCurrentView('services');
    };

    const confirmBooking = (newBooking) => {
        setBookings(prev => [...prev, {
            id: `b${prev.length + 1}`,
            ...newBooking,
            status: 'confirmed'
        }]);
        setCurrentView('bookings');
    };

    const handleScheduleRequestUpdate = (requestId, status) => {
        const request = scheduleRequests.find(r => r.id === requestId);
        if (!request) return;

        // Update request status
        setScheduleRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: status } : r));

        // If approved, update specialist's schedule
        if (status === 'approved') {
            setSpecialists(prevSpecs => prevSpecs.map(spec => {
                if (spec.id === request.specialistId) {
                    const newSchedule = { ...spec.workSchedule, [request.date]: request.requestedSlots };
                    return { ...spec, workSchedule: newSchedule };
                }
                return spec;
            }));
        }
    };
    
    const handleAddScheduleRequest = (newRequest) => {
        setScheduleRequests(prev => [...prev, {
            id: `scr${prev.length + 1}`,
            ...newRequest
        }]);
    };

    const handleAddReview = (bookingId, specialistId, newReviewData) => {
        const newReview = {
            id: `r${Date.now()}`,
            ...newReviewData,
            isModerated: false,
        };

        // Add review to the specialist
        setSpecialists(prev => prev.map(spec => {
            if (spec.id === specialistId) {
                return { ...spec, reviews: [...spec.reviews, newReview] };
            }
            return spec;
        }));

        // Mark the booking as having a review submitted
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, reviewSubmitted: true } : b));
    };

    const renderContent = () => {
        if (currentView === 'admin' && isAdmin) {
            return (
                <AdminScreen
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    language={language}
                    // Pass state and setters to admin panel
                    services={services}
                    setServices={setServices}
                    specialists={specialists}
                    setSpecialists={setSpecialists}
                    bookings={bookings}
                    setBookings={setBookings}
                    news={news}
                    setNews={setNews}
                    scheduleRequests={scheduleRequests}
                    onScheduleRequestUpdate={handleScheduleRequestUpdate}
                    onAddScheduleRequest={handleAddScheduleRequest}
                />
            );
        }
        
        if (currentView === 'bookingFlow' && bookingState.service) {
            return (
                <BookingFlow 
                    service={bookingState.service}
                    initialSpecialistId={bookingState.specialistId}
                    specialists={specialists.filter(sp => bookingState.service?.specialistIds.includes(sp.id))}
                    bookings={bookings}
                    services={services}
                    onConfirm={confirmBooking}
                    onExit={exitBookingFlow}
                    language={language}
                    userId={currentUser.id}
                />
            );
        }
        
        if (currentView === 'serviceDetail' && selectedService) {
            return (
                <ServiceDetailScreen
                    t={t}
                    lt={lt}
                    service={selectedService}
                    specialists={specialists.filter(s => selectedService.specialistIds.includes(s.id))}
                    onBook={() => startBooking(selectedService)}
                    onBack={exitServiceDetail}
                 />
            );
        }

        switch (currentView) {
            case 'services':
                return <ServicesScreen t={t} lt={lt} services={services} specialists={specialists} onBook={startBooking} onShowDetail={showServiceDetail} />;
            case 'bookings':
                return <MyBookingsScreen t={t} lt={lt} bookings={bookings.filter(b => b.userId === currentUser.id)} services={services} specialists={specialists} setBookings={setBookings} onAddReview={handleAddReview} currentUser={currentUser} />;
            case 'news':
                return <NewsScreen t={t} lt={lt} publications={news} />;
            case 'specialists':
                return <SpecialistsScreen t={t} lt={lt} specialists={specialists} services={services} onBook={startBooking} />;
            case 'profile':
                return <ProfileScreen 
                    t={t} 
                    user={currentUser} 
                    setUser={setCurrentUser} 
                    onAdminLogin={handleLogin}
                    privilegedUsers={privilegedUsers} 
                />;
            default:
                return <ServicesScreen t={t} lt={lt} services={services} specialists={specialists} onBook={startBooking} onShowDetail={showServiceDetail} />;
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen p-4">
            <div className="w-full max-w-md h-[800px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans relative">
                {!isAdmin && <LanguageSwitcher currentLanguage={language} setLanguage={setLanguage} />}
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>
                {(!isAdmin && currentView !== 'bookingFlow' && currentView !== 'serviceDetail' && currentView !== 'admin') && (
                    <BottomNav currentView={currentView} setCurrentView={setCurrentView} t={t} />
                )}
            </div>
        </div>
    );
};

export default App;