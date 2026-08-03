import { Schema, model } from 'mongoose';
import { type IUser, type ICreateUser, UserRole } from '../types/User.js';

interface IUserDocument extends IUser, Omit<ICreateUser, 'username' | 'email'>, Document {}

const userSchema = new Schema<IUserDocument>({
    name: { 
        type: String, 
        required: [true, "El nombre es requerido"], 
        trim: true 
    },
    lastname: { 
        type: String, 
        required: [true, "El apellido es requerido"], 
        trim: true 
    },
    username: { 
        type: String, 
        required: [true, "El nombre de usuario es requerido"], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "email requerido"], 
        unique: [true, "El email ya existe"], 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String,
        enum: {
            values: Object.values(UserRole),
            message:  '{VALUE} no es role válido'
        },
        default: UserRole.USER,
        required: [true, "El role es requerido"] 
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    timestamps: true,
    versionKey: false
});

export const User = model<IUserDocument>('User', userSchema);