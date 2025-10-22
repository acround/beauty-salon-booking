
export type Language = 'ru' | 'en' | 'sr';

export interface LocalizedString {
    ru: string;
    en: string;
    sr: string;
}

export interface Service {
    id: string;
    name: LocalizedString;
    description: LocalizedString;
    category: LocalizedString;
    price: number;
    duration: number; // in minutes
    specialistIds: string[];
    image?: string;
}

export interface Specialist {
    id: string;
    name: string;
    bio: LocalizedString;
    avatar: string;
    services: string[];
    rating: number;
    reviews: Review[];
    workSchedule: Record<string, string[]>; // e.g. { "2024-07-25": ["09:00", "10:00"] }
    accessKey: string;
}

export interface Review {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    isModerated: boolean;
}

export interface Booking {
    id: string;
    userId: string;
    serviceId: string;
    specialistId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    status: 'confirmed' | 'cancelled' | 'completed';
    reviewSubmitted?: boolean;
}

export enum PublicationType {
    News = 'news',
    Promotion = 'promotion'
}

export interface Publication {
    id:string;
    type: PublicationType;
    title: LocalizedString;
    content: LocalizedString;
    image: string;
    publishDate: string;
    promoPeriod?: {
        start: string;
        end: string;
    }
}

export enum Role {
    User = 'user',
    Admin = 'admin',
    Specialist = 'specialist'
}

export interface User {
    id: string;
    telegramUsername: string;
    name: string;
    phone: string;
    role: Role;
    specialistId?: string; // if role is Specialist
}

export enum ScheduleChangeRequestStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface ScheduleChangeRequest {
    id: string;
    specialistId: string;
    specialistName: string;
    date: string; // YYYY-MM-DD
    requestedSlots: string[]; // new requested time slots for the date
    reason: string;
    status: ScheduleChangeRequestStatus;
}