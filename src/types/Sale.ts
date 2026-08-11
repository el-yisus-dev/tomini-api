import { Types } from "mongoose";

export enum SaleStatus {
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    TRANSFER = "TRANSFER"
}

export interface ISaleItem {
    product: Types.ObjectId;
    productVariant: Types.ObjectId;

    name: string;
    sku?: string | null;

    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface ISale {
    store: Types.ObjectId;

    cashRegister: Types.ObjectId;
    cashier: Types.ObjectId;

    items: ISaleItem[];

    subtotal: number;
    discount: number;
    total: number;

    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;

    status: SaleStatus;

    createdAt: Date;
    updatedAt: Date;
}