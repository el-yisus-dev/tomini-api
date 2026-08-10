import { Schema, model } from "mongoose";
import { ProductUnit } from "../types/ProductVariant.js";

const productVariantSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "El producto es obligatorio"],
            index: true
        },

        name: {
            type: String,
            required: [true, "El nombre de la variante es obligatorio"],
            trim: true,
            minlength: [
                1,
                "El nombre de la variante debe tener al menos 1 carácter"
            ],
            maxlength: [
                100,
                "El nombre de la variante no puede superar los 100 caracteres"
            ]
        },

        sku: {
            type: String,
            required: [true, "El SKU es obligatorio"],
            trim: true,
            maxlength: [
                50,
                "El SKU no puede superar los 50 caracteres"
            ],
            index: true
        },

        barcode: {
            type: String,
            trim: true,
            default: null,
            maxlength: [
                50,
                "El código de barras no puede superar los 50 caracteres"
            ],
            index: true
        },

        purchasePrice: {
            type: Number,
            required: [true, "El precio de compra es obligatorio"],
            min: [
                0,
                "El precio de compra no puede ser negativo"
            ]
        },

        salePrice: {
            type: Number,
            required: [true, "El precio de venta es obligatorio"],
            min: [
                0,
                "El precio de venta no puede ser negativo"
            ]
        },

        minStock: {
            type: Number,
            required: [true, "El stock mínimo es obligatorio"],
            min: [
                0,
                "El stock mínimo no puede ser negativo"
            ],
            default: 0
        },

        unit: {
            type: String,
            enum: {
                values: Object.values(ProductUnit),
                message: "La unidad de medida no es válida"
            },
            required: [true, "La unidad de medida es obligatoria"]
        },

        quantity: {
            type: Number,
            required: [true, "La cantidad es obligatoria"],
            min: [
                0.01,
                "La cantidad debe ser mayor a 0"
            ]
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

productVariantSchema.index({
    product: 1,
    isActive: 1
});

export const ProductVariant = model(
    "ProductVariant",
    productVariantSchema
);