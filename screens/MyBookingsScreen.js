

import React, { useState } from 'react';
import Icon from '../components/Icon';

const MyBookingsScreen = ({ t, lt, bookings, services, specialists, setBookings, onAddReview, currentUser }) => {
    const now = new Date();
    const [reviewingBookingId, setReviewingBookingId] = useState(null);
    
    const upcomingBookings = bookings.filter(b => new Date(`${b.date}T${b.time}`) >= now && b.status === 'confirmed');
    const pastBookings = bookings.filter(b => new Date(`${b.date}T${b.time}`) < now || b.status !== 'confirmed');

    const handleCancel = (bookingId) => {
        const bookingToCancel = bookings.find(b => b.id === bookingId);
        if (!bookingToCancel) return;

        const bookingTime = new Date(`${bookingToCancel.date}T${bookingToCancel.time}`);
        const hoursDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            alert(t('cancellationPolicy'));
            return;
        }

        if (window.confirm("Are you sure you want to cancel this booking?")) {
            setBookings(currentBookings =>
                currentBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
            );
        }
    };
    
    const handleReviewSubmit = (rating, comment) => {
        if (!reviewingBookingId) return;
        const booking = bookings.find(b => b.id === reviewingBookingId);
        if (!booking) return;

        onAddReview(booking.id, booking.specialistId, {
            userId: currentUser.id,
            rating,
            comment,
        });

        setReviewingBookingId(null); // Close the form
    };

    return (
        <div className="bg-gray-50 min-h-full">
            <header className="p-4 bg-brand-primary text-white sticky top-0 shadow-md">
                <h1 className="text-xl font-bold text-center">{t('myBookingsTitle')}</h1>
            </header>
            <main className="p-4 space-y-6">
                <section>
                    <h2 className="text-lg font-semibold text-brand-text mb-3">{t('upcoming')}</h2>
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} services={services} specialists={specialists} onCancel={handleCancel} t={t} lt={lt} isUpcoming />)}
                        </div>
                    ) : <p className="text-gray-500">No upcoming bookings.</p>}
                </section>
                <section>
                    <h2 className="text-lg font-semibold text-brand-text mb-3">{t('past')}</h2>
                    {pastBookings.length > 0 ? (
                        <div className="space-y-4">
                            {pastBookings.map(b => <BookingCard key={b.id} booking={b} services={services} specialists={specialists} onCancel={handleCancel} onReview={() => setReviewingBookingId(b.id)} t={t} lt={lt} />)}
                        </div>
                    ) : <p className="text-gray-500">No past bookings.</p>}
                </section>
            </main>
            {reviewingBookingId && (
                <ReviewForm 
                    t={t} 
                    onSubmit={handleReviewSubmit}
                    onClose={() => setReviewingBookingId(null)}
                />
            )}
        </div>
    );
};

const BookingCard = ({ booking, services, specialists, onCancel, onReview, t, lt, isUpcoming }) => {
    const service = services.find(s => s.id === booking.serviceId);
    const specialist = specialists.find(s => s.id === booking.specialistId);

    if (!service || !specialist) return null;

    return (
        <div className={`p-4 bg-white rounded-lg shadow-md ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-brand-text">{lt(service.name)}</h3>
                    <p className="text-sm text-brand-text-light">{specialist.name}</p>
                    <p className="text-sm text-brand-text-light">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : (booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')}`}>
                    {booking.status}
                </span>
            </div>
            {isUpcoming && booking.status === 'confirmed' && (
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <button onClick={() => onCancel(booking.id)} className="text-sm text-red-600 font-semibold">
                        {t('cancelBooking')}
                    </button>
                </div>
            )}
            {booking.status === 'completed' && !booking.reviewSubmitted && (
                 <div className="mt-4 pt-4 border-t flex justify-end">
                    <button onClick={onReview} className="text-sm text-brand-primary font-semibold">
                        {t('leaveReview')}
                    </button>
                </div>
            )}
        </div>
    );
};

const ReviewForm = ({ t, onSubmit, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        onSubmit(rating, comment);
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-center mb-4">{t('leaveReview')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setRating(star)}>
                                <Icon name="star" className={`w-8 h-8 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Your comment..."
                        className="w-full p-2 border rounded-md h-24"
                    />
                    <div className="flex justify-end space-x-2">
                         <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg">
                            Cancel
                        </button>
                        <button type="submit" className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyBookingsScreen;