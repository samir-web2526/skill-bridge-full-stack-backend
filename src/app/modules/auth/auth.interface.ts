export type ILoginPayload = {
    email: string;
    password: string;
}

export type IRegisterPayload = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    image?: string;
    role: 'STUDENT' | 'TUTOR';
    // Tutor profile fields
    bio?: string;
    hourlyRate?: number;
    experience?: number;
    categoryId?: string;
    availableFrom?: string;
    availableTo?: string;
    // Student profile fields
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    class?: string;
    group?: string;
}
