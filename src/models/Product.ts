import { Schema, model } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre del producto es obligatorio"],
            trim: true,
            minlength: [
                2,
                "El nombre debe tener al menos 2 caracteres"
            ],
            maxlength: [
                100,
                "El nombre no puede superar los 100 caracteres"
            ]
        },

        description: {
            type: String,
            trim: true,
            default: null,
            maxlength: [
                500,
                "La descripción no puede superar los 500 caracteres"
            ]
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "La categoría del producto es obligatoria"],
            index: true
        },

        store: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: [true, "La tienda del producto es obligatoria"],
            index: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

productSchema.index({
    store: 1,
    category: 1,
    isActive: 1
});

export const Product = model("Product", productSchema);