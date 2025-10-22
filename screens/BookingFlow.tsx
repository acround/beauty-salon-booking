import React, { useState, useMemo } from 'react';
import { Service, Specialist, Booking, Language } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Icon from '../components/Icon';

interface BookingFlowProps {
    service: Service;
    specialists: Specialist[];
    bookings: Booking[];
    services: Service[];
    onConfirm: (booking: Omit<Booking, 'id' | 'status'>) => void;
    onExit: () => void;
    language: Language;
    userId: string;
    initialSpecialistId?: string | null;
}

type Step = 'specialist' | 'datetime' | 'confirm';

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const BOOKING_BUFFER_MINUTES = 10;

const BookingFlow: React.FC<BookingFlowProps> = ({ service, specialists, bookings, services, onConfirm, onExit, language, userId, initialSpecialistId }) => {
    const { t, lt } = useLocalization(language);
    const [step, setStep] = useState<Step>(initialSpecialistId ? 'datetime' : 'specialist');
    const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | 'any'>(initialSpecialistId || 'any');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');

    const handleSpecialistSelect = (id: string | 'any') => {
        setSelectedSpecialistId(id);
        setStep('datetime');
    };
    
    const handleDateTimeSelect = (date: string, time: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleConfirm = () => {
        let finalSpecialistId = selectedSpecialistId;
        if (finalSpecialistId === 'any') {
             const availableSpecialists = specialists.filter(sp => {
                const slotStart = timeToMinutes(selectedTime);
                const slotEnd = slotStart + service.duration + BOOKING_BUFFER_MINUTES;

                const specialistBookingsOnDate = bookings
                    .filter(b => b.date === selectedDate && b.specialistId === sp.id)
                    .map(b => {
                        const bookedService = services.find(s => s.id === b.serviceId);
                        const duration = (bookedService?.duration || 60) + BOOKING_BUFFER_MINUTES;
                        return {
                            start: timeToMinutes(b.time),
                            end: timeToMinutes(b.time) + duration
                        };
                    });
                
                const isOverlapping = specialistBookingsOnDate.some(booking => {
                     return slotStart < booking.end && booking.start < slotEnd;
                });

                const isInSchedule = sp.workSchedule[selectedDate]?.includes(selectedTime);
                
                const scheduleForDay = sp.workSchedule[selectedDate] || [];
                const lastSlotInSchedule = scheduleForDay.length > 0 ? scheduleForDay[scheduleForDay.length - 1] : null;
                const endOfWorkDay = lastSlotInSchedule ? timeToMinutes(lastSlotInSchedule) + 60 : 0; // Assume 60 min slots for schedule definition
                const fitsInSchedule = slotEnd <= endOfWorkDay;


                return isInSchedule && !isOverlapping && fitsInSchedule;
            });
            
            if(availableSpecialists.length > 0) {
                finalSpecialistId = availableSpecialists[0].id;
            } else {
                alert("Error: No specialist available at this time.");
                return;
            }
        }
        onConfirm({
            userId,
            serviceId: service.id,
            specialistId: finalSpecialistId,
            date: selectedDate,
            time: selectedTime
        });
    };

    const getHeader = () => {
        switch(step) {
            case 'specialist': return t('chooseSpecialist');
            case 'datetime': return t('chooseDateTime');
            case 'confirm': return t('confirmBooking');
        }
    }

    const goBack = () => {
        if(step === 'datetime') {
            if (initialSpecialistId) {
                onExit();
            } else {
                setStep('specialist');
            }
        }
        if(step === 'confirm') setStep('datetime');
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="p-4 bg-brand-primary text-white flex items-center sticky top-0 shadow-md">
                {(step !== 'specialist' || initialSpecialistId) && <button onClick={goBack} className="mr-4"><Icon name="chevronLeft"/></button>}
                <h1 className="text-xl font-bold">{getHeader()}</h1>
                <button onClick={onExit} className="ml-auto text-sm">Exit</button>
            </header>
            <main className="flex-grow p-4">
                <div className="mb-4 p-3 bg-brand-secondary rounded-lg">
                    <h2 className="font-bold text-brand-primary">{lt(service.name)}</h2>
                    <p className="text-sm text-brand-text-light">{lt(service.description)}</p>
                    <p className="text-sm text-brand-primary font-medium mt-2">
                        {t('bookingDurationInfo', { duration: service.duration })}
                    </p>
                </div>

                {step === 'specialist' && <SpecialistStep specialists={specialists} onSelect={handleSpecialistSelect} t={t} />}
                {step === 'datetime' && <DateTimeStep service={service} services={services} specialists={specialists} bookings={bookings} selectedSpecialistId={selectedSpecialistId} onSelect={handleDateTimeSelect} t={t} />}
                {step === 'confirm' && (
                    <ConfirmStep 
                        service={service}
                        specialist={specialists.find(s => s.id === selectedSpecialistId) || (selectedSpecialistId === 'any' ? {name: t('anySpecialist')} as Specialist : undefined)}
                        date={selectedDate}
                        time={selectedTime}
                        onConfirm={handleConfirm}
                        t={t}
                        lt={lt}
                    />
                )}
            </main>
        </div>
    );
};

const SpecialistStep: React.FC<{specialists: Specialist[], onSelect: (id: string | 'any') => void, t: any}> = ({ specialists, onSelect, t }) => (
    <div className="space-y-3">
        <button onClick={() => onSelect('any')} className="w-full text-left p-4 bg-white rounded-lg shadow flex items-center space-x-4 hover:bg-gray-100 transition">
            <div className="w-16 h-16 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M22 11h-2.1c-.5-2.4-2.2-4.4-4.3-5.5"/><path d="M4.1 11H2M12 2v2.5"/><path d="M6.6 7.5 4.8 6"/><path d="M17.4 7.5 19.2 6"/></svg>
            </div>
            <div>
                <h3 className="font-bold text-lg">{t('anySpecialist')}</h3>
            </div>
        </button>
        {specialists.map(sp => (
            <button key={sp.id} onClick={() => onSelect(sp.id)} className="w-full text-left p-4 bg-white rounded-lg shadow flex items-center space-x-4 hover:bg-gray-100 transition">
                <img src={sp.avatar} alt={sp.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h3 className="font-bold text-lg">{sp.name}</h3>
                    <p className="text-sm text-gray-500">Rating: {sp.rating} ★</p>
                </div>
            </button>
        ))}
    </div>
);

const DateTimeStep: React.FC<{
    service: Service,
    services: Service[],
    specialists: Specialist[], 
    bookings: Booking[], 
    selectedSpecialistId: string | 'any', 
    onSelect: (date: string, time: string) => void, 
    t: any
}> = ({ service, services, specialists, bookings, selectedSpecialistId, onSelect, t }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    const [displayDate, setDisplayDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState('');
    const [timeOfDay, setTimeOfDay] = useState<'any' | 'morning' | 'afternoon' | 'evening'>('any');

    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];

        // Get all bookings on the selected date and calculate their full blocked time (duration + buffer)
        const bookingsOnDate = bookings
            .filter(b => b.date === selectedDate)
            .map(b => {
                const bookedService = services.find(s => s.id === b.serviceId);
                const duration = (bookedService?.duration || 60) + BOOKING_BUFFER_MINUTES;
                return {
                    specialistId: b.specialistId,
                    start: timeToMinutes(b.time),
                    end: timeToMinutes(b.time) + duration,
                };
            });

        const relevantSpecialists = selectedSpecialistId === 'any'
            ? specialists
            : specialists.filter(s => s.id === selectedSpecialistId);

        const uniqueSlots = new Set<string>();

        relevantSpecialists.forEach(sp => {
            const scheduleForDay = sp.workSchedule[selectedDate] || [];
            const specialistBookings = bookingsOnDate.filter(b => b.specialistId === sp.id);

            const lastSlotInSchedule = scheduleForDay.length > 0 ? scheduleForDay[scheduleForDay.length - 1] : null;
            // Assuming 60 min slots for schedule definition to calculate end of day
            const endOfWorkDay = lastSlotInSchedule ? timeToMinutes(lastSlotInSchedule) + 60 : 0;

            scheduleForDay.forEach(potentialStartTime => {
                const slotStart = timeToMinutes(potentialStartTime);
                const slotEnd = slotStart + service.duration + BOOKING_BUFFER_MINUTES;

                // Check 1: Does it overlap with existing bookings?
                const isOverlapping = specialistBookings.some(booking => {
                    return slotStart < booking.end && booking.start < slotEnd;
                });

                // Check 2: Does the full service duration + buffer fit within the workday?
                const fitsInSchedule = slotEnd <= endOfWorkDay;

                if (!isOverlapping && fitsInSchedule) {
                    uniqueSlots.add(potentialStartTime);
                }
            });
        });

        const sortedSlots = Array.from(uniqueSlots).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

        if (timeOfDay === 'any') {
            return sortedSlots;
        }

        return sortedSlots.filter(time => {
            const hour = parseInt(time.split(':')[0]);
            if (timeOfDay === 'morning') return hour < 12;
            if (timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
            if (timeOfDay === 'evening') return hour >= 17;
            return false; // Should not be reached
        });

    }, [selectedDate, selectedSpecialistId, specialists, bookings, services, timeOfDay, service.duration]);

    const handleMonthChange = (offset: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoid issues with different month lengths
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const handleDateSelect = (dateStr: string) => {
        const clickedDate = new Date(dateStr);
        // Compare dates by ignoring time part. new Date(dateStr) has timezone issues.
        const [year, month, day] = dateStr.split('-').map(Number);
        const normalizedClickedDate = new Date(year, month - 1, day);

        if (normalizedClickedDate < today) return; // Prevent selecting past dates
        setSelectedDate(dateStr);
    };

    const handleMonthYearChange = (month: number, year: number) => {
        const newDate = new Date(displayDate);
        newDate.setFullYear(year, month, 1);
        setDisplayDate(newDate);
    };

    const Calendar = () => {
        const month = displayDate.getMonth();
        const year = displayDate.getFullYear();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array.from({ length: firstDayOfMonth });
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const monthNames = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
        const currentYear = new Date().getFullYear();
        const years = Array.from({length: 5}, (_, i) => currentYear + i);

        return (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-100">
                        <Icon name="chevronLeft" />
                    </button>
                    <div className="flex space-x-2">
                         <select
                            value={month}
                            onChange={(e) => handleMonthYearChange(parseInt(e.target.value), year)}
                            className="p-1 border rounded-md bg-white"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => handleMonthYearChange(month, parseInt(e.target.value))}
                            className="p-1 border rounded-md bg-white"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100">
                        <Icon name="chevronRight" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {dayNames.map(d => <div key={d} className="font-semibold text-gray-500">{d}</div>)}
                    {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                    {days.map(day => {
                        const date = new Date(year, month, day);
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = dateStr === selectedDate;
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        const [sYear, sMonth, sDay] = dateStr.split('-').map(Number);
                        const normalizedDate = new Date(sYear, sMonth - 1, sDay);
                        const isPast = normalizedDate < today;

                        let classNames = 'p-2 rounded-full transition-colors duration-200';
                        if (isPast) {
                            classNames += ' text-gray-300 cursor-not-allowed';
                        } else {
                            classNames += ' hover:bg-brand-secondary';
                        }
                        if (isSelected) {
                            classNames += ' bg-brand-primary text-white';
                        } else if (isToday) {
                            classNames += ' border border-brand-primary';
                        }

                        return (
                            <button key={day} onClick={() => handleDateSelect(dateStr)} disabled={isPast} className={classNames}>
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        )
    }

    const TimeOfDayFilter = () => (
        <div className="my-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">{t('timeOfDay')}</h4>
            <div className="flex justify-between space-x-2">
                {(['anyTime', 'morning', 'afternoon', 'evening'] as const).map(period => (
                    <button
                        key={period}
                        onClick={() => setTimeOfDay(period === 'anyTime' ? 'any' : period)}
                        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-full transition ${timeOfDay === (period === 'anyTime' ? 'any' : period) ? 'bg-brand-primary text-white shadow' : 'bg-white text-brand-text border'}`}
                    >
                        {t(period)}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <Calendar />
            {selectedDate && (
                 <div>
                    <TimeOfDayFilter />
                    <div className="grid grid-cols-4 gap-2">
                        {availableSlots.length > 0 ? availableSlots.map(time => (
                            <button key={time} onClick={() => onSelect(selectedDate, time)} className="p-3 bg-white rounded-lg shadow text-center font-semibold text-brand-primary hover:bg-brand-secondary transition">
                                {time}
                            </button>
                        )) : <p className="col-span-4 text-center text-gray-500 mt-4">{t('noAvailableSlots')}</p>}
                    </div>
                 </div>
            )}
        </div>
    );
};

const ConfirmStep: React.FC<{
    service: Service, 
    specialist?: Specialist, 
    date: string, 
    time: string, 
    onConfirm: () => void, 
    t: any, 
    lt: any
}> = ({ service, specialist, date, time, onConfirm, t, lt }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-lg text-center space-y-4">
            <h3 className="text-2xl font-bold text-brand-primary">{t('bookingConfirmed')}</h3>
            <div className="text-left space-y-2 text-brand-text">
                <p><strong>Service:</strong> {lt(service.name)}</p>
                <p><strong>Specialist:</strong> {specialist?.name}</p>
                <p><strong>Date:</strong> {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> {time}</p>
            </div>
            <button onClick={onConfirm} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-transform duration-200 ease-in-out transform hover:scale-105">
                {t('confirmBooking')}
            </button>
        </div>
    );
}

export default BookingFlow;