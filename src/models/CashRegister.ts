import mongoose, { Schema } from "mongoose";

import type { ICashRegister } from "../types/CashRegister.js";
import { CashRegisterStatus } from "../types/CashRegister.js";


const cashRegisterSchema = new Schema<ICashRegister>(
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

        openedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [
                true,
                "El usuario que abre la caja es obligatorio"
            ]
        },

        closedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        openingAmount: {
            type: Number,
            required: [
                true,
                "El monto de apertura es obligatorio"
            ],
            min: [
                0,
                "El monto de apertura no puede ser negativo"
            ]
        },

        closingAmount: {
            type: Number,
            default: null,
            min: [
                0,
                "El monto de cierre no puede ser negativo"
            ]
        },

        difference: {
            type: Number,
            default: null
        },

        status: {
            type: String,
            enum: {
                values: Object.values(CashRegisterStatus),
                message: "El estado de la caja no es válido"
            },
            default: CashRegisterStatus.OPEN,
            required: [
                true,
                "El estado de la caja es obligatorio"
            ],
            index: true
        },

        openedAt: {
            type: Date,
            default: Date.now,
            required: [
                true,
                "La fecha de apertura es obligatoria"
            ]
        },

        closedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

cashRegisterSchema.index(
    {
        store: 1,
        status: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            status: CashRegisterStatus.OPEN
        }
    }
);

export const CashRegister = mongoose.model<ICashRegister>(
    "CashRegister",
    cashRegisterSchema
);