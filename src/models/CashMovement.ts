import mongoose, { Schema } from "mongoose";
import type { ICashMovement } from "../types/CashRegister.js";
import { CashRegisterStatus, CashMovementType } from "../types/CashRegister.js";

const cashMovementSchema = new Schema<ICashMovement>(
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

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [
                true,
                "El usuario es obligatorio"
            ]
        },

        type: {
            type: String,
            enum: {
                values: Object.values(CashMovementType),
                message: "El tipo de movimiento de caja no es válido"
            },
            required: [
                true,
                "El tipo de movimiento es obligatorio"
            ],
            index: true
        },

        amount: {
            type: Number,
            required: [
                true,
                "El monto del movimiento es obligatorio"
            ],
            min: [
                0.01,
                "El monto del movimiento debe ser mayor a 0"
            ]
        },

        reason: {
            type: String,
            trim: true,
            maxlength: [
                500,
                "El motivo no puede superar los 500 caracteres"
            ],
            default: null
        },

        reference: {
            type: Schema.Types.ObjectId,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

cashMovementSchema.index({
    cashRegister: 1,
    createdAt: -1
});

cashMovementSchema.index({
    store: 1,
    createdAt: -1
});

export const CashMovement = mongoose.model<ICashMovement>(
    "CashMovement",
    cashMovementSchema
);
