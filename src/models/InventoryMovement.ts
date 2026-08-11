import { Schema, model } from "mongoose";
import { InventoryMovementType } from "../types/InventoryMovement.js";

const inventoryMovementSchema = new Schema(
    {
        store: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: [true, "La tienda es obligatoria"],
            index: true
        },

        productVariant: {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
            required: [true, "La variante del producto es obligatoria"],
            index: true
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario responsable es obligatorio"],
            index: true
        },

        type: {
            type: String,
            enum: {
                values: Object.values(InventoryMovementType),
                message: "El tipo de movimiento no es válido"
            },
            required: [true, "El tipo de movimiento es obligatorio"],
            index: true
        },

        quantity: {
            type: Number,
            required: [true, "La cantidad del movimiento es obligatoria"],
            validate: {
                validator: (value: number) => value !== 0,
                message: "La cantidad del movimiento no puede ser 0"
            }
        },

        previousStock: {
            type: Number,
            required: [true, "El stock anterior es obligatorio"],
            min: [
                0,
                "El stock anterior no puede ser negativo"
            ]
        },

        newStock: {
            type: Number,
            required: [true, "El nuevo stock es obligatorio"],
            min: [
                0,
                "El nuevo stock no puede ser negativo"
            ]
        },

        reason: {
            type: String,
            trim: true,
            default: null,
            maxlength: [
                500,
                "El motivo no puede superar los 500 caracteres"
            ]
        },

        reference: {
            type: Schema.Types.ObjectId,
            default: null,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

inventoryMovementSchema.index({
    store: 1,
    productVariant: 1,
    createdAt: -1
});

inventoryMovementSchema.index({
    store: 1,
    user: 1,
    createdAt: -1
});

export const InventoryMovement = model(
    "InventoryMovement",
    inventoryMovementSchema
);