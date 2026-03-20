export enum UserRole {
    Admin = 0,
    Manager = 1,
    CounterStaff = 2
}

export interface AuthResponse {
    id: string;
    userName: string;
    fullName: string;
    role: UserRole;
    token: string;
}

export interface User {
    id: string;
    userName: string;
    fullName: string;
    role: UserRole;
}
