import { Types } from "mongoose";

export enum ProductUnit {
    ML = "ML",
    L = "L",
    MG = "MG",
    G = "G",
    KG = "KG",
    PIECE = "PIECE",
    PACK = "PACK",
    BOX = "BOX"
}

export interface IProductVariant {
    product: Types.ObjectId;
    name: string;
    sku: string;
    barcode?: string | null;
    purchasePrice: number;
    salePrice: number;
    minStock: number;
    unit: ProductUnit;
    quantity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}