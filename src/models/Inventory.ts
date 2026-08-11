import { Schema, model } from "mongoose";

const inventorySchema = new Schema(
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

        stock: {
            type: Number,
            required: [true, "El stock es obligatorio"],
            min: [
                0,
                "El stock no puede ser negativo"
            ],
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

inventorySchema.index(
    {
        store: 1,
        productVariant: 1
    },
    {
        unique: true
    }
);

export const Inventory = model(
    "Inventory",
    inventorySchema
);