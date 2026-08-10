import { Types } from "mongoose";

export interface ICategory {
    name: string;
    description?: string | null;
    store: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}