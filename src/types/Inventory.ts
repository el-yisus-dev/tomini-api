import { Types } from "mongoose";

export interface IInventory {
    store: Types.ObjectId;
    productVariant: Types.ObjectId;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
}