import { Types } from "mongoose";


export interface IProduct {
    name: string;
    description?: string | null;
    category: Types.ObjectId;
    store: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}