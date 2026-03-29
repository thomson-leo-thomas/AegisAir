export type UserRole = "admin" | "fireforce" | "user";

export interface UserProfile {
    uid: string;
    email: string;
    fullName: string;
    phone: string;
    city: string;
    state: string;
    role: UserRole;
    deviceId?: string;
    createdAt: number;
    profileComplete: boolean;
}
