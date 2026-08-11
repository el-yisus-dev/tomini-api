import mongoose, { Schema } from "mongoose";

import type {
    ISale,
    ISaleItem
} from "../types/Sale.js";

import {
    PaymentMethod,
    SaleStatus
} from "../types/Sale.js";

const saleItemSchema = new Schema<ISaleItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [
                true,
                "El producto es obligatorio"
            ]
        },

        productVariant: {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
            required: [
                true,
                "La variante del producto es obligatoria"
            ]
        },

        name: {
            type: String,
            required: [
                true,
                "El nombre del producto es obligatorio"
            ],
            trim: true
        },

        sku: {
            type: String,
            default: null,
            trim: true
        },

        quantity: {
            type: Number,
            required: [
                true,
                "La cantidad es obligatoria"
            ],
            min: [
                1,
                "La cantidad debe ser mayor a 0"
            ]
        },

        unitPrice: {
            type: Number,
            required: [
                true,
                "El precio unitario es obligatorio"
            ],
            min: [
                0,
                "El precio unitario no puede ser negativo"
            ]
        },

        subtotal: {
            type: Number,
            required: [
                true,
                "El subtotal es obligatorio"
            ],
            min: [
                0,
                "El subtotal no puede ser negativo"
            ]
        }
    },
    {
        _id: false
    }
);

const saleSchema = new Schema<ISale>(
    {
        store: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: [
                true,
                "La tienda es obligatoria"
            ],
            index: true
        },

        cashRegister: {
            type: Schema.Types.ObjectId,
            ref: "CashRegister",
            required: [
                true,
                "La caja es obligatoria"
            ],
            index: true
        },

        cashier: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [
                true,
                "El cajero es obligatorio"
            ],
            index: true
        },

        items: {
            type: [saleItemSchema],
            required: [
                true,
                "Los productos de la venta son obligatorios"
            ],
            validate: {
                validator: (items: ISaleItem[]) =>
                    items.length > 0,
                message: "La venta debe contener al menos un producto"
            }
        },

        subtotal: {
            type: Number,
            required: [
                true,
                "El subtotal de la venta es obligatorio"
            ],
            min: [
                0,
                "El subtotal no puede ser negativo"
            ]
        },

        discount: {
            type: Number,
            required: [
                true,
                "El descuento es obligatorio"
            ],
            default: 0,
            min: [
                0,
                "El descuento no puede ser negativo"
            ]
        },

        total: {
            type: Number,
            required: [
                true,
                "El total de la venta es obligatorio"
            ],
            min: [
                0,
                "El total no puede ser negativo"
            ]
        },

        paymentMethod: {
            type: String,
            enum: {
                values: Object.values(PaymentMethod),
                message: "El método de pago no es válido"
            },
            required: [
                true,
                "El método de pago es obligatorio"
            ]
        },

        amountPaid: {
            type: Number,
            required: [
                true,
                "El monto recibido es obligatorio"
            ],
            min: [
                0,
                "El monto recibido no puede ser negativo"
            ]
        },

        change: {
            type: Number,
            required: [
                true,
                "El cambio es obligatorio"
            ],
            min: [
                0,
                "El cambio no puede ser negativo"
            ]
        },

        status: {
            type: String,
            enum: {
                values: Object.values(SaleStatus),
                message: "El estado de la venta no es válido"
            },
            default: SaleStatus.COMPLETED,
            required: [
                true,
                "El estado de la venta es obligatorio"
            ],
            index: true
        }
    },
    {
        timestamps: true
    }
);

saleSchema.index({
    store: 1,
    createdAt: -1
});

saleSchema.index({
    cashRegister: 1,
    createdAt: -1
});

export const Sale = mongoose.model<ISale>(
    "Sale",
    saleSchema
);