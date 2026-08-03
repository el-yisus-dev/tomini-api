import { Types } from 'mongoose';

export enum UserRole{
    ADMIN = 'admin',
    USER = 'user'
}
// Interfaz principal de usuario
export interface IUser {
    id?: string;
    username: string;
    lastname: string;
    name: string;
    email: string;
    enabled: boolean;
    isVerified: boolean;
    role: UserRole;
    createAt: Date;
}
// Interfaz para crear un usuario
export interface ICreateUser {
    username: string;
    email: string;
    password: string;
}