import { Types } from "mongoose";

export enum CashRegisterStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}

export enum CashMovementType {
    SALE = "SALE",
    REFUND = "REFUND",
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL"
}

export interface ICashRegister {
    store: Types.ObjectId;

    openedBy: Types.ObjectId;
    closedBy?: Types.ObjectId | null;

    openingAmount: number;

    closingAmount?: number | null;
    difference?: number | null;

    status: CashRegisterStatus;

    openedAt: Date;
    closedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

export interface ICashMovement {
    store: Types.ObjectId;

    cashRegister: Types.ObjectId;
    user: Types.ObjectId;

    type: CashMovementType;

    amount: number;

    reason?: string | null;
    reference?: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date;
}