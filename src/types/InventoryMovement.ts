import { Types } from "mongoose";

export enum InventoryMovementType {
    PURCHASE = "PURCHASE",
    SALE = "SALE",
    ADJUSTMENT = "ADJUSTMENT",
    DAMAGE = "DAMAGE",
    RETURN = "RETURN",
    CANCELLATION = "CANCELLATION"
}

export interface IInventoryMovement {
    store: Types.ObjectId;
    productVariant: Types.ObjectId;
    user: Types.ObjectId;

    type: InventoryMovementType;

    quantity: number;

    previousStock: number;
    newStock: number;

    reason?: string | null;

    reference?: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date;
}