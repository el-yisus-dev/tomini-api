import { Schema, model } from "mongoose";


const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [
                true,
                "El nombre de la categoría es obligatorio"
            ],
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

        store: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: [
                true,
                "La tienda es obligatoria"
            ],
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


categorySchema.index({
    store: 1,
    isActive: 1
});


export const Category = model(
    "Category",
    categorySchema
);