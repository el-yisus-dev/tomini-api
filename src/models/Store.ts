import { Schema, model } from "mongoose";
import type { IStore } from "../types/Store.js";

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, "El nombre de la tienda es requerido"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [100, "El nombre no puede superar los 100 caracteres"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "La descripción no puede superar los 500 caracteres",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [20, "El teléfono no puede superar los 20 caracteres"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: [300, "La dirección no puede superar los 300 caracteres"],
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El propietario de la tienda es requerido"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storeSchema.index({
  owner: 1,
  name: 1,
});

export const Store = model<IStore>("Store", storeSchema);