
import React, { useState, useEffect, useMemo } from 'react';
import { Role, ScheduleChangeRequestStatus, PublicationType } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import TranslatedInput from '../components/TranslatedInput.jsx';
import Icon from '../components/Icon.jsx';

const emptyLocalizedString = { ru: '', en: '', sr: '' };

const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
);

const DashboardView = ({ services, specialists, bookings, news, t }) => {
    const upcomingBookingsCount = bookings.filter(b => b.status === 'confirmed' && new Date(`${b.date}T${b.time}`) >= new Date()).length;
    const totalServicesCount = services.length;
    const totalSpecialistsCount = specialists.length;
    const totalPublicationsCount = news.length;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('dashboardTitle')}</h2>
            <div className="grid grid-cols-2 gap-6">
                <StatCard title={t('totalServices')} value={totalServicesCount} />
                <StatCard title={t('totalSpecialists')} value={totalSpecialistsCount} />
                <StatCard title={t('upcomingBookings')} value={upcomingBookingsCount} />
                <StatCard title={t('totalPublications')} value={totalPublicationsCount} />
            </div>
        </div>
    );
};

const AdminScreen = (props) => {
    const { currentUser, onLogout, language } = props;
    const { t } = useLocalization(language);
    const [view, setView] = useState('dashboard');

    const isAdmin = currentUser.role === Role.Admin;

    const renderView = () => {
        switch(view) {
            case 'dashboard':
                 return <DashboardView t={t} {...props} />;
            case 'specialists':
                if (!isAdmin) return <p>Access Denied</p>;
                return <SpecialistManagement {...props} />;
            case 'services':
                if (!isAdmin) return <p>Access Denied</p>;
                return <ServiceManagement {...props} />;
            case 'schedule':
                return <ScheduleManagement {...props} t={t} />;
            case 'publications':
                if (!isAdmin) return <p>Access Denied</p>;
                return <PublicationManagement {...props} t={t} />;
            case 'stats':
                 if (!isAdmin) return <p>Access Denied</p>;
                 return <StatisticsView t={t} {...props} />;
             case 'reviews':
                 if (!isAdmin) return <p>Access Denied</p>;
                 return <ReviewManagementView {...props} t={t} />;
            default:
                return <DashboardView t={t} {...props} />;
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <header className="p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 shadow-lg z-10">
                <h1 className="text-xl font-bold">{isAdmin ? "Admin Panel" : "Specialist Panel"}</h1>
                <button onClick={onLogout} className="text-sm font-semibold hover:text-brand-accent">Logout</button>
            </header>
            <div className="flex flex-grow overflow-hidden">
                <nav className="w-1/4 bg-gray-700 text-white p-4 space-y-2 overflow-y-auto">
                    <AdminNavLink onClick={() => setView('dashboard')} label="Dashboard" active={view === 'dashboard'} />
                    {isAdmin && (
                        <>
                        <AdminNavLink onClick={() => setView('specialists')} label="Specialists" active={view === 'specialists'} />
                        <AdminNavLink onClick={() => setView('services')} label="Services" active={view === 'services'} />
                        </>
                    )}
                    <AdminNavLink onClick={() => setView('schedule')} label="Schedule" active={view === 'schedule'} />
                    {isAdmin && (
                        <>
                        <AdminNavLink onClick={() => setView('publications')} label="Publications" active={view === 'publications'} />
                        <AdminNavLink onClick={() => setView('reviews')} label="Reviews" active={view === 'reviews'} />
                        <AdminNavLink onClick={() => setView('stats')} label="Statistics" active={view === 'stats'} />
                        </>
                    )}
                </nav>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

const AdminNavLink = ({onClick, label, active}) => (
    <button 
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-gray-900' : 'hover:bg-gray-600'}`}
    >
        {label}
    </button>
);

const SpecialistManagement = ({ specialists, setSpecialists }) => {
    const [editingSpecialist, setEditingSpecialist] = useState(null);

    const handleSave = (spec) => {
        if(editingSpecialist && editingSpecialist.id === spec.id){
            setSpecialists(prev => prev.map(s => s.id === spec.id ? spec : s));
        } else {
            setSpecialists(prev => [...prev, {...spec, id: `spec${prev.length + 1}`, reviews: []}]);
        }
        setEditingSpecialist(null);
    }
    
    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Specialists</h2>
            {!editingSpecialist ? (
                <>
                <button onClick={() => setEditingSpecialist({})} className="mb-4 bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">
                    Add Specialist
                </button>
                <div className="space-y-2">
                    {specialists.map(spec => (
                        <div key={spec.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                            <span>{spec.name}</span>
                            <button onClick={() => setEditingSpecialist(spec)} className="text-sm text-blue-600">Edit</button>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <SpecialistForm 
                    specialist={editingSpecialist} 
                    onSave={handleSave} 
                    onCancel={() => setEditingSpecialist(null)}
                    setSpecialists={setSpecialists}
                />
            )}
        </div>
    )
}

const SpecialistForm = ({ specialist, onSave, onCancel, setSpecialists }) => {
    const [formState, setFormState] = useState(specialist);
    const [openSection, setOpenSection] = useState('basic');
    
    useEffect(() => {
        const approvedReviews = (formState.reviews || []).filter(r => r.isModerated);
        const newRating = approvedReviews.length > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
            : 0;

        if (newRating.toFixed(1) !== (formState.rating || 0).toFixed(1)) {
            handleChange('rating', newRating);
        }
    }, [formState.reviews]);

    const handleToggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const handleChange = (field, value) => {
        setFormState(prev => ({...prev, [field]: value}));
    };

    const handleReviewAction = (reviewId, action) => {
        let updatedReviews;

        switch(action) {
            case 'approve':
                updatedReviews = (formState.reviews || []).map(review => 
                    review.id === reviewId ? { ...review, isModerated: true } : review
                );
                break;
            case 'unapprove':
                updatedReviews = (formState.reviews || []).map(review => 
                    review.id === reviewId ? { ...review, isModerated: false } : review
                );
                break;
            case 'reject':
                if (window.confirm("Are you sure you want to permanently reject this review? This action cannot be undone.")) {
                    updatedReviews = (formState.reviews || []).filter(review => review.id !== reviewId);
                } else {
                    updatedReviews = formState.reviews;
                }
                break;
            default:
                updatedReviews = formState.reviews;
        }
        handleChange('reviews', updatedReviews);
    };


    const renderSection = (key, title, content) => (
        <div className="border-b">
            <button 
                onClick={() => handleToggleSection(key)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <span>{title}</span>
                <Icon name={openSection === key ? 'chevronUp' : 'chevronDown'} className="w-5 h-5 text-gray-500" />
            </button>
            {openSection === key && <div className="p-4 bg-gray-50">{content}</div>}
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold p-4 border-b">{formState.id ? 'Edit' : 'Add'} Specialist</h3>
            
            <div>
                {renderSection('basic', 'Basic Info', (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" value={formState.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                            <input type="text" value={formState.avatar || ''} onChange={(e) => handleChange('avatar', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                ))}
                
                {renderSection('bio', 'Biography', (
                    <TranslatedInput 
                        label=""
                        value={formState.bio || emptyLocalizedString}
                        onChange={(val) => handleChange('bio', val)}
                        isTextarea
                    />
                ))}

                {renderSection('access', 'Access & Security', (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Access Key</label>
                        <input type="text" value={formState.accessKey || ''} onChange={(e) => handleChange('accessKey', e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., anna_pass_123" />
                    </div>
                ))}

                {renderSection('reviews', 'Ratings & Reviews', (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Overall Rating (from approved reviews)</label>
                            <p className="mt-1 text-lg font-semibold text-brand-text">{formState.rating ? `${formState.rating.toFixed(1)} ★` : 'No approved reviews'}</p>
                        </div>

                        <div>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Reviews</h4>
                            {(formState.reviews && formState.reviews.length > 0) ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto border p-2 rounded-md">
                                    {formState.reviews.map(review => (
                                        <div key={review.id} className="p-2 bg-white rounded shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="font-semibold text-brand-primary">{review.rating} ★</span>
                                                <p className="text-xs text-gray-400">User: {review.userId}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 my-1">{review.comment}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                 <span className={`text-xs px-2 py-0.5 rounded-full ${review.isModerated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {review.isModerated ? 'Approved' : 'Pending'}
                                                </span>
                                                <div className="flex space-x-2">
                                                    {!review.isModerated ? (
                                                        <>
                                                            <button onClick={() => handleReviewAction(review.id, 'approve')} className="flex items-center text-xs text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded">
                                                                <Icon name="checkCircle" className="w-4 h-4 mr-1"/> Approve
                                                            </button>
                                                            <button onClick={() => handleReviewAction(review.id, 'reject')} className="flex items-center text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
                                                                <Icon name="xCircle" className="w-4 h-4 mr-1"/> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleReviewAction(review.id, 'unapprove')} className="text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
                                                            Unapprove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No reviews yet.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex space-x-2 p-4 bg-gray-50 border-t">
                <button onClick={() => onSave(formState)} className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">Save</button>
                <button onClick={onCancel} className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
            </div>
        </div>
    );
}


const ServiceManagement = ({ services, setServices, specialists }) => {
    const [editingService, setEditingService] = useState(null);

    const handleSave = (service) => {
        if(editingService && editingService.id){
            setServices(prev => prev.map(s => s.id === service.id ? service : s));
        } else {
            setServices(prev => [...prev, {...service, id: `s${prev.length + 1}`}]);
        }
        setEditingService(null);
    }

     const handleDelete = (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            setServices(prev => prev.filter(s => s.id !== serviceId));
        }
    };
    
    return(
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Services</h2>
            {!editingService ? (
                <>
                <button onClick={() => setEditingService({})} className="mb-4 bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">
                    Add Service
                </button>
                <div className="space-y-2">
                    {services.map(service => (
                        <div key={service.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                            <span>{service.name.ru}</span>
                            <div className="space-x-2">
                                <button onClick={() => setEditingService(service)} className="text-sm text-blue-600">Edit</button>
                                <button onClick={() => handleDelete(service.id)} className="text-sm text-red-600">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <ServiceForm 
                    service={editingService} 
                    onSave={handleSave} 
                    onCancel={() => setEditingService(null)}
                    specialists={specialists}
                />
            )}
        </div>
    )
}

const ServiceForm = ({ service, onSave, onCancel, specialists }) => {
    const [formState, setFormState] = useState(service);

    const handleChange = (field, value) => {
        setFormState(prev => ({...prev, [field]: value}));
    };

    const handleSpecialistToggle = (specId) => {
        const currentIds = formState.specialistIds || [];
        const newIds = currentIds.includes(specId) 
            ? currentIds.filter(id => id !== specId)
            : [...currentIds, specId];
        handleChange('specialistIds', newIds);
    };

    return (
        <div className="bg-white rounded-lg shadow-inner p-4 space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">{formState.id ? 'Edit' : 'Add'} Service</h3>
            
            <TranslatedInput label="Name" value={formState.name || emptyLocalizedString} onChange={(v) => handleChange('name', v)} />
            <TranslatedInput label="Description" value={formState.description || emptyLocalizedString} onChange={(v) => handleChange('description', v)} isTextarea />
            <TranslatedInput label="Category" value={formState.category || emptyLocalizedString} onChange={(v) => handleChange('category', v)} />
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input type="text" value={formState.image || ''} onChange={(e) => handleChange('image', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price (RSD)</label>
                    <input type="number" value={formState.price || ''} onChange={(e) => handleChange('price', Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input type="number" value={formState.duration || ''} onChange={(e) => handleChange('duration', Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Specialists</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {specialists.map(spec => (
                        <div key={spec.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`spec-${spec.id}`}
                                checked={(formState.specialistIds || []).includes(spec.id)}
                                onChange={() => handleSpecialistToggle(spec.id)}
                                className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                            />
                            <label htmlFor={`spec-${spec.id}`} className="ml-2 block text-sm text-gray-900">{spec.name}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
                <button onClick={() => onSave(formState)} className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">Save</button>
                <button onClick={onCancel} className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
            </div>
        </div>
    )
}

const ScheduleManagement = (props) => {
    const { currentUser, specialists, setSpecialists, scheduleRequests, onScheduleRequestUpdate, onAddScheduleRequest, t } = props;
    const isAdmin = currentUser.role === Role.Admin;
    
    // Admin states
    const [selectedSpecialistId, setSelectedSpecialistId] = useState(specialists[0]?.id || '');
    
    // Shared states
    const [displayDate, setDisplayDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Specialist states
    const [requestHours, setRequestHours] = useState('');
    const [requestReason, setRequestReason] = useState('');

    const currentSpecialist = useMemo(() => {
        return isAdmin 
            ? specialists.find(s => s.id === selectedSpecialistId) 
            : specialists.find(s => s.id === currentUser.specialistId);
    }, [isAdmin, selectedSpecialistId, currentUser.specialistId, specialists]);
    
    const handleMonthChange = (offset) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleDirectScheduleUpdate = (date, newSlots) => {
        setSpecialists(prev => prev.map(s => s.id === selectedSpecialistId ? { ...s, workSchedule: { ...s.workSchedule, [date]: newSlots } } : s));
    };
    
    const handleRequestSubmit = () => {
        if (!currentSpecialist || !selectedDate) return;
        const newRequest = {
            specialistId: currentSpecialist.id,
            specialistName: currentSpecialist.name,
            date: selectedDate,
            requestedSlots: requestHours.split(',').map(s => s.trim()).filter(Boolean),
            reason: requestReason,
            status: ScheduleChangeRequestStatus.Pending,
        };
        onAddScheduleRequest(newRequest);
        setRequestHours('');
        setRequestReason('');
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('scheduleManagementTitle')}</h2>
            
            {isAdmin && (
                 <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{t('pendingRequests')}</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {scheduleRequests.filter(r => r.status === 'pending').length > 0 ? (
                            scheduleRequests.filter(r => r.status === 'pending').map(req => (
                                <div key={req.id} className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{req.specialistName} - <span className="font-mono">{req.date}</span></p>
                                            <p className="text-sm text-gray-600 mt-1">Reason: <span className="italic">{req.reason}</span></p>
                                        </div>
                                         <div className="flex space-x-2 mt-1">
                                            <button onClick={() => onScheduleRequestUpdate(req.id, 'approved')} className="flex items-center text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"><Icon name="checkCircle" className="w-4 h-4 mr-1"/>{t('approve')}</button>
                                            <button onClick={() => onScheduleRequestUpdate(req.id, 'rejected')} className="flex items-center text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"><Icon name="xCircle" className="w-4 h-4 mr-1"/>{t('reject')}</button>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-yellow-200">
                                      <p className="text-sm text-gray-800 font-medium">Requested Hours: <span className="font-mono text-blue-600">{req.requestedSlots.join(', ') || t('dayOff')}</span></p>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500">{t('noPendingRequests')}</p>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-4 bg-white rounded-lg shadow">
                    {isAdmin && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('selectSpecialist')}</label>
                            <select value={selectedSpecialistId} onChange={e => setSelectedSpecialistId(e.target.value)} className="w-full p-2 border rounded-md mt-1">
                                {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <CalendarView 
                        displayDate={displayDate} 
                        selectedDate={selectedDate}
                        onMonthChange={handleMonthChange}
                        onDateSelect={setSelectedDate}
                        workSchedule={currentSpecialist?.workSchedule || {}}
                    />
                </div>

                <div className="p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">{isAdmin ? t('editSchedule') : t('mySchedule')} for <span className="font-mono text-brand-primary">{selectedDate}</span></h3>
                    <ScheduleEditor 
                        isAdmin={isAdmin}
                        selectedDate={selectedDate}
                        schedule={currentSpecialist?.workSchedule[selectedDate] || []}
                        onUpdate={handleDirectScheduleUpdate}
                        t={t}
                    />

                    {!isAdmin && (
                        <div className="mt-6 border-t pt-4">
                             <h3 className="text-lg font-semibold mb-2">{t('requestChange')}</h3>
                             <div className="space-y-3">
                                 <div>
                                     <label className="text-sm font-medium">{t('newWorkHours')}</label>
                                     <input value={requestHours} onChange={e => setRequestHours(e.target.value)} placeholder="09:00, 10:00, 14:00" className="w-full p-2 border rounded mt-1" />
                                     <p className="text-xs text-gray-500 mt-1">{t('newWorkHoursHelp')}</p>
                                 </div>
                                 <div>
                                     <label className="text-sm font-medium">{t('reasonForChange')}</label>
                                     <textarea value={requestReason} onChange={e => setRequestReason(e.target.value)} className="w-full p-2 border rounded mt-1" rows={2}></textarea>
                                 </div>
                                 <button onClick={handleRequestSubmit} className="bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">{t('submitRequest')}</button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
             {!isAdmin && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">{t('myRequests')}</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {scheduleRequests.filter(r => r.specialistId === currentUser.specialistId).length > 0 ? (
                            scheduleRequests.filter(r => r.specialistId === currentUser.specialistId).map(req => (
                                <div key={req.id} className="p-2 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{req.date}</p>
                                        <p className="text-sm text-gray-600">Reason: {req.reason}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full text-white ${
                                        req.status === 'pending' ? 'bg-yellow-500' : req.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                    }`}>{req.status}</span>
                                </div>
                            ))
                        ) : <p className="text-sm text-gray-500">No requests submitted.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

const CalendarView = ({ displayDate, selectedDate, onMonthChange, onDateSelect, workSchedule }) => {
    const month = displayDate.getMonth();
    const year = displayDate.getFullYear();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => onMonthChange(-1)}><Icon name="chevronLeft" /></button>
                <h4 className="font-bold">{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={() => onMonthChange(1)}><Icon name="chevronRight" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {dayNames.map(d => <div key={d} className="font-semibold text-gray-600">{d}</div>)}
                {blanks.map(b => <div key={b}></div>)}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const hasWork = workSchedule[dateStr] && workSchedule[dateStr].length > 0;
                    return (
                        <button 
                            key={day}
                            onClick={() => onDateSelect(dateStr)}
                            className={`p-2 rounded-full relative ${isSelected ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}
                        >
                            {day}
                            {hasWork && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ScheduleEditor = ({ isAdmin, selectedDate, schedule, onUpdate, t }) => {
    const [newTime, setNewTime] = useState('');

    const handleAdd = () => {
        if (newTime && !schedule.includes(newTime)) {
            const newSchedule = [...schedule, newTime].sort();
            onUpdate(selectedDate, newSchedule);
            setNewTime('');
        }
    };
    
    const handleRemove = (timeToRemove) => {
        onUpdate(selectedDate, schedule.filter(t => t !== timeToRemove));
    };

    const handleClearDay = () => {
        if (window.confirm(`Are you sure you want to clear all slots for ${selectedDate}?`)) {
            onUpdate(selectedDate, []);
        }
    };

    return (
        <div className="space-y-3">
            <div className="max-h-48 overflow-y-auto border p-3 rounded-md space-y-2 bg-gray-50">
                {schedule.length > 0 ? schedule.map(time => (
                    <div key={time} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                        <span className="text-sm font-mono font-semibold text-gray-700">{time}</span>
                        {isAdmin && <button onClick={() => handleRemove(time)} className="text-red-500 hover:text-red-700 text-xs font-bold">REMOVE</button>}
                    </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">{t('dayOff')}</p>}
            </div>
            {isAdmin && (
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full p-2 border rounded-md" />
                        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 rounded-md text-sm font-semibold hover:bg-blue-600">Add</button>
                    </div>
                     <button onClick={handleClearDay} className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition text-sm">
                        {t('clearDay')}
                    </button>
                </div>
            )}
        </div>
    );
};


const PublicationManagement = ({ news, setNews, t }) => {
    const [editingPublication, setEditingPublication] = useState(null);

    const handleSave = (publication) => {
        if (editingPublication && editingPublication.id) {
            setNews(prev => prev.map(p => p.id === publication.id ? publication : p));
        } else {
            setNews(prev => [...prev, { ...publication, id: `pub${prev.length + 1}` }]);
        }
        setEditingPublication(null);
    };

    const handleDelete = (publicationId) => {
        if (window.confirm("Are you sure you want to delete this publication?")) {
            setNews(prev => prev.filter(p => p.id !== publicationId));
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('publicationManagementTitle')}</h2>
            {!editingPublication ? (
                <>
                    <button onClick={() => setEditingPublication({})} className="mb-4 bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">
                        {t('addPublication')}
                    </button>
                    <div className="space-y-2">
                        {news.map(pub => (
                            <div key={pub.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                                <div>
                                    <span className="font-semibold">{pub.title.ru}</span>
                                    <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{pub.type}</span>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => setEditingPublication(pub)} className="text-sm text-blue-600">Edit</button>
                                    <button onClick={() => handleDelete(pub.id)} className="text-sm text-red-600">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <PublicationForm
                    publication={editingPublication}
                    onSave={handleSave}
                    onCancel={() => setEditingPublication(null)}
                    t={t}
                />
            )}
        </div>
    );
};

const PublicationForm = ({ publication, onSave, onCancel, t }) => {
    const [formState, setFormState] = useState(publication);

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handlePromoPeriodChange = (part, value) => {
        handleChange('promoPeriod', {
            ...formState.promoPeriod,
            [part]: value,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-inner p-4 space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">{formState.id ? t('editPublication') : t('addPublication')}</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('publicationType')}</label>
                <select
                    value={formState.type || PublicationType.News}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                >
                    <option value={PublicationType.News}>{t('news')}</option>
                    <option value={PublicationType.Promotion}>{t('promo')}</option>
                </select>
            </div>

            <TranslatedInput label={t('title')} value={formState.title || emptyLocalizedString} onChange={(v) => handleChange('title', v)} />
            <TranslatedInput label={t('text')} value={formState.content || emptyLocalizedString} onChange={(v) => handleChange('content', v)} isTextarea />

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('imageURL')}</label>
                <input type="text" value={formState.image || ''} onChange={(e) => handleChange('image', e.target.value)} className="w-full p-2 border rounded" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('publishDate')}</label>
                <input type="date" value={formState.publishDate || ''} onChange={(e) => handleChange('publishDate', e.target.value)} className="w-full p-2 border rounded" />
            </div>

            {formState.type === PublicationType.Promotion && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('promoPeriod')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600">{t('promoStart')}</label>
                            <input type="date" value={formState.promoPeriod?.start || ''} onChange={(e) => handlePromoPeriodChange('start', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600">{t('promoEnd')}</label>
                            <input type="date" value={formState.promoPeriod?.end || ''} onChange={(e) => handlePromoPeriodChange('end', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex space-x-2 pt-4 border-t">
                <button onClick={() => onSave(formState)} className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">Save</button>
                <button onClick={onCancel} className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600">Cancel</button>
            </div>
        </div>
    );
};

const StatisticsView = ({ bookings, services, specialists, t }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('specialist');
    const [selectedId, setSelectedId] = useState('');
    
    const [report, setReport] = useState(null);

    const handleGenerateReport = () => {
        if (!startDate || !endDate || !selectedId) {
            alert('Please select a date range and a filter option.');
            return;
        }

        const filteredBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Normalize dates to avoid timezone issues
            bookingDate.setUTCHours(0, 0, 0, 0);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(0, 0, 0, 0);

            const isDateInRange = bookingDate.getTime() >= start.getTime() && bookingDate.getTime() <= end.getTime();
            if (!isDateInRange) return false;

            if (filterType === 'specialist') {
                return booking.specialistId === selectedId;
            }
            if (filterType === 'service') {
                return booking.serviceId === selectedId;
            }
            return false;
        });

        const totalRevenue = filteredBookings.reduce((sum, booking) => {
            const service = services.find(s => s.id === booking.serviceId);
            return sum + (service?.price || 0);
        }, 0);

        setReport({
            bookings: filteredBookings,
            totalBookings: filteredBookings.length,
            totalRevenue: totalRevenue
        });
    };

    const options = filterType === 'specialist' ? specialists : services;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('statisticsTitle')}</h2>

            <div className="p-4 bg-white rounded-lg shadow mb-6 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('startDate')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('endDate')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('filterBy')}</label>
                        <select value={filterType} onChange={e => { setFilterType(e.target.value); setSelectedId(''); setReport(null); }} className="w-full p-2 border rounded-md mt-1 bg-white">
                            <option value="specialist">{t('specialist')}</option>
                            <option value="service">{t('service')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 invisible">{t('selectOption')}</label>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white" disabled={!filterType}>
                            <option value="">{t('selectOption')}</option>
                            {options.map(option => (
                                <option key={option.id} value={option.id}>{filterType === 'specialist' ? option.name : option.name.ru}</option>
                            ))}
                        </select>
                    </div>
                 </div>
                 <button onClick={handleGenerateReport} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">
                    {t('generateReport')}
                </button>
            </div>

            {report && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">{t('reportResults')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <StatCard title={t('totalBookingsReport')} value={report.totalBookings} />
                        <StatCard title={t('totalRevenueReport')} value={`${report.totalRevenue.toLocaleString()} RSD`} />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                         <h4 className="font-semibold mb-2">{t('detailedListOfBookings')}</h4>
                         <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {report.bookings.length > 0 ? report.bookings.map(booking => {
                                const service = services.find(s => s.id === booking.serviceId);
                                const specialist = specialists.find(s => s.id === booking.specialistId);
                                return (
                                     <div key={booking.id} className="p-3 border rounded-md grid grid-cols-1 md:grid-cols-4 gap-2 text-sm bg-gray-50">
                                        <div><strong>{t('date')}:</strong> {booking.date} @ {booking.time}</div>
                                        <div><strong>{t('service')}:</strong> {service?.name.ru}</div>
                                        <div><strong>{t('specialist')}:</strong> {specialist?.name}</div>
                                        <div className="font-semibold text-right">{service?.price} RSD</div>
                                     </div>
                                );
                            }) : <p className="text-gray-500 text-center py-4">{t('noBookingsFound')}</p>}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReviewManagementView = ({ specialists, setSpecialists, t }) => {
    const allReviews = useMemo(() => {
        return specialists.flatMap(spec => 
            spec.reviews.map(review => ({
                ...review,
                specialistId: spec.id,
                specialistName: spec.name,
            }))
        );
    }, [specialists]);

    const pendingReviews = allReviews.filter(r => !r.isModerated);
    const approvedReviews = allReviews.filter(r => r.isModerated);

    const handleReviewAction = (specialistId, reviewId, action) => {
        setSpecialists(prevSpecialists => 
            prevSpecialists.map(spec => {
                if (spec.id === specialistId) {
                    let updatedReviews;
                    if (action === 'reject') {
                         if (!window.confirm("Are you sure you want to permanently reject this review?")) return spec;
                        updatedReviews = spec.reviews.filter(r => r.id !== reviewId);
                    } else {
                        updatedReviews = spec.reviews.map(r => 
                            r.id === reviewId 
                            ? { ...r, isModerated: action === 'approve' } 
                            : r
                        );
                    }

                    const approved = updatedReviews.filter(r => r.isModerated);
                    const newRating = approved.length > 0 
                        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length 
                        : 0;

                    return { ...spec, reviews: updatedReviews, rating: newRating };
                }
                return spec;
            })
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">{t('reviewManagementTitle')}</h2>

            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{t('pendingReviews')}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {pendingReviews.length > 0 ? pendingReviews.map(review => (
                        <ReviewCard key={review.id} review={review} onAction={handleReviewAction} t={t} />
                    )) : <p className="text-sm text-gray-500">{t('noPendingReviews')}</p>}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">{t('approvedReviews')}</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {approvedReviews.length > 0 ? approvedReviews.map(review => (
                        <ReviewCard key={review.id} review={review} onAction={handleReviewAction} t={t} />
                    )) : <p className="text-sm text-gray-500">{t('noApprovedReviews')}</p>}
                </div>
            </div>
        </div>
    );
};

const ReviewCard = ({ review, onAction, t }) => (
    <div className="p-3 bg-white rounded-lg shadow-md border">
        <div className="flex justify-between items-start">
            <div>
                <span className="font-bold text-brand-primary">{review.rating} ★</span>
                <span className="text-sm text-gray-600 ml-2">{t('forSpecialist')} <span className="font-semibold">{review.specialistName}</span></span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${review.isModerated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {review.isModerated ? 'Approved' : 'Pending'}
            </span>
        </div>
        <p className="text-sm text-gray-700 my-2 italic">"{review.comment}"</p>
        <div className="flex justify-end space-x-2">
            {!review.isModerated ? (
                <>
                    <button onClick={() => onAction(review.specialistId, review.id, 'approve')} className="flex items-center text-xs text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded">
                        <Icon name="checkCircle" className="w-4 h-4 mr-1"/> {t('approve')}
                    </button>
                    <button onClick={() => onAction(review.specialistId, review.id, 'reject')} className="flex items-center text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">
                        <Icon name="xCircle" className="w-4 h-4 mr-1"/> {t('reject')}
                    </button>
                </>
            ) : (
                <button onClick={() => onAction(review.specialistId, review.id, 'unapprove')} className="text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
                    {t('unapprove')}
                </button>
            )}
        </div>
    </div>
);


export default AdminScreen;