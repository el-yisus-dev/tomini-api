import type { Request, Response } from "express";

import { CashMovement } from "../models/CashMovement.js";
import { CashRegister } from "../models/CashRegister.js";
import { Store } from "../models/Store.js";

import {
    CashMovementType,
    CashRegisterStatus
} from "../types/CashRegister.js";

import { errorHandler } from "../middleware/Error.js";

export const createCashMovement = async (
    req: Request,
    res: Response
) => {
    try {
        const { type, amount, reason } = req.body;
        const { _id: owner } = res.locals.user;

        const store = await Store.findOne({
            owner,
            isActive: true
        }).select("_id");

        if (!store) {
            res.status(404).json({
                status: "error",
                message: "No se encontró una tienda activa"
            });

            return;
        }

        const cashRegister = await CashRegister.findOne({
            store: store._id,
            status: CashRegisterStatus.OPEN
        }).select("_id");

        if (!cashRegister) {
            res.status(404).json({
                status: "error",
                message: "No hay una caja abierta"
            });

            return;
        }

        const cashMovement = await CashMovement.create({
            store: store._id,
            cashRegister: cashRegister._id,
            user: owner,
            type,
            amount,
            reason
        });

        res.status(201).json({
            status: "success",
            message:
                type === CashMovementType.DEPOSIT
                    ? "Depósito registrado correctamente"
                    : "Retiro registrado correctamente",
            data: cashMovement
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};