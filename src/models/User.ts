import { Model, Schema, model, type HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

import { type IUser, type IUserMethods, UserRole } from "../types/User.js";

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser, Model<IUser, {}, IUserMethods>>(
    {
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


userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  password: string
) {
  return bcrypt.compare(password, this.password);
};


export const User = model<IUser>("User", userSchema);