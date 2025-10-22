
import { PublicationType, Role, ScheduleChangeRequestStatus } from './types';

const mockReviews = [
    { id: 'r1', userId: 'user1', rating: 5, comment: 'Amazing service, Dr. Petrova is very professional!', isModerated: true },
    { id: 'r2', userId: 'user1', rating: 4, comment: 'Good massage, but the room was a bit cold.', isModerated: false },
    { id: 'r3', userId: 'user1', rating: 5, comment: 'Marko is the best masseur in town!', isModerated: true },
];

// Helper function to generate work schedules for the current month
const generateCurrentMonthSchedule = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const specialist1Schedule = {};
    const specialist2Schedule = {};

    const spec1WeekdaySlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
    const spec2WeekdaySlots = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const saturdaySlots = ['08:00', '09:00', '10:00', '11:00', '12:00'];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (dayOfWeek === 0) { // Sunday is a day off
            continue;
        }

        if (dayOfWeek === 6) { // Saturday
            specialist1Schedule[dateString] = saturdaySlots;
            // Specialist 2 does not work on Saturdays
        } else { // Weekdays (Monday to Friday)
            specialist1Schedule[dateString] = spec1WeekdaySlots;
            specialist2Schedule[dateString] = spec2WeekdaySlots;
        }
    }

    return { specialist1Schedule, specialist2Schedule };
};

const { specialist1Schedule, specialist2Schedule } = generateCurrentMonthSchedule();


export const mockSpecialists = [
    {
        id: 'spec1',
        name: 'Dr. Anna Petrova',
        bio: { ru: 'Ведущий косметолог с 10-летним опытом.', en: 'Leading cosmetologist with 10 years of experience.', sr: 'Водећи козметолог са 10 година искуства.' },
        avatar: 'https://picsum.photos/id/1027/200/200',
        services: ['s1', 's2'],
        rating: 4.9,
        reviews: [mockReviews[0]],
        workSchedule: specialist1Schedule,
        accessKey: 'anna_pass'
    },
    {
        id: 'spec2',
        name: 'Marko Ivanović',
        bio: { ru: 'Специалист по массажу и спа-процедурам.', en: 'Specialist in massage and spa treatments.', sr: 'Специјалиста за масажу и спа третмане.' },
        avatar: 'https://picsum.photos/id/1005/200/200',
        services: ['s3', 's4'],
        rating: 4.8,
        reviews: [mockReviews[1], mockReviews[2]],
        workSchedule: specialist2Schedule,
        accessKey: 'marko_pass'
    },
];

export const mockServices = [
    {
        id: 's1',
        name: { ru: 'Чистка лица', en: 'Facial Cleansing', sr: 'Чишћење лица' },
        description: { ru: 'Глубокое очищение кожи лица.', en: 'Deep cleansing of the facial skin.', sr: 'Дубинско чишћење коже лица.' },
        category: { ru: 'Косметология', en: 'Cosmetology', sr: 'Козметологија' },
        price: 3000,
        duration: 60,
        specialistIds: ['spec1'],
        image: 'https://picsum.photos/id/103/400/300'
    },
    {
        id: 's2',
        name: { ru: 'Пилинг', en: 'Peeling', sr: 'Пилинг' },
        description: { ru: 'Химический пилинг для обновления кожи.', en: 'Chemical peel for skin renewal.', sr: 'Хемијски пилинг за обнову коже.' },
        category: { ru: 'Косметология', en: 'Cosmetology', sr: 'Козметологија' },
        price: 4500,
        duration: 45,
        specialistIds: ['spec1'],
        image: 'https://picsum.photos/id/201/400/300'
    },
    {
        id: 's3',
        name: { ru: 'Массаж спины', en: 'Back Massage', sr: 'Масажа леђа' },
        description: { ru: 'Классический расслабляющий массаж спины.', en: 'Classic relaxing back massage.', sr: 'Класична опуштајућа масажа леђа.' },
        category: { ru: 'Массаж', en: 'Massage', sr: 'Масажа' },
        price: 2500,
        duration: 50,
        specialistIds: ['spec2'],
        image: 'https://picsum.photos/id/145/400/300'
    },
    {
        id: 's4',
        name: { ru: 'Антицеллюлитный массаж', en: 'Anti-cellulite Massage', sr: 'Антицелулит масажа' },
        description: { ru: 'Интенсивный массаж для коррекции фигуры.', en: 'Intensive massage for body shaping.', sr: 'Интензивна масажа за обликовање тела.' },
        category: { ru: 'Массаж', en: 'Massage', sr: 'Масажа' },
        price: 3500,
        duration: 60,
        specialistIds: ['spec2'],
        image: 'https://picsum.photos/id/31/400/300'
    }
];

export const mockUsers = [
    { id: 'user1', telegramUsername: 'testuser', name: 'Elena', phone: '+79123456789', role: Role.User },
    { id: 'admin1', telegramUsername: 'admin', name: 'Admin', phone: '+79999999999', role: Role.Admin },
    { id: 'spec_user_1', telegramUsername: 'dr_anna', name: 'Dr. Anna Petrova', phone: '+79876543210', role: Role.Specialist, specialistId: 'spec1'},
    { id: 'spec_user_2', telegramUsername: 'marko_masseur', name: 'Marko Ivanović', phone: '+38161234567', role: Role.Specialist, specialistId: 'spec2'},
];

export const mockBookings = [
    { id: 'b1', userId: 'user1', serviceId: 's1', specialistId: 'spec1', date: '2024-07-20', time: '10:00', status: 'completed' },
    { id: 'b2', userId: 'user1', serviceId: 's3', specialistId: 'spec2', date: '2024-08-01', time: '12:00', status: 'confirmed' },
];

export const mockNews = [
    {
        id: 'n1',
        type: PublicationType.News,
        title: { ru: 'Новый аппарат для лазерной эпиляции', en: 'New device for laser hair removal', sr: 'Нови апарат за ласерску епилацију' },
        content: { ru: 'Мы рады сообщить о поступлении нового диодного лазера...', en: 'We are pleased to announce the arrival of a new diode laser...', sr: 'Са задовољством објављујемо долазак новог диодног ласера...' },
        image: 'https://picsum.photos/id/431/400/300',
        publishDate: '2024-07-15'
    },
    {
        id: 'p1',
        type: PublicationType.Promotion,
        title: { ru: 'Скидка 20% на все виды массажа', en: '20% discount on all types of massage', sr: '20% попуста на све врсте масажа' },
        content: { ru: 'Только до конца месяца! Запишитесь на любой массаж и получите скидку 20%.', en: 'Only until the end of the month! Book any massage and get a 20% discount.', sr: 'Само до краја месеца! Резервишите било коју масажу и остварите 20% попуста.' },
        image: 'https://picsum.photos/id/211/400/300',
        publishDate: '2024-07-10',
        promoPeriod: { start: '2024-07-10', end: '2024-07-31' }
    }
];

export const mockScheduleChangeRequests = [
    {
        id: 'scr1',
        specialistId: 'spec2',
        specialistName: 'Marko Ivanović',
        date: '2024-08-05',
        requestedSlots: ['10:00', '11:00', '12:00', '14:00', '15:00'],
        reason: 'Need to adjust my schedule for a personal appointment in the afternoon.',
        status: ScheduleChangeRequestStatus.Pending,
    },
     {
        id: 'scr2',
        specialistId: 'spec1',
        specialistName: 'Dr. Anna Petrova',
        date: '2024-08-06',
        requestedSlots: [],
        reason: 'Requesting day off for a family event.',
        status: ScheduleChangeRequestStatus.Approved,
    }
];