import type { Request, Response } from "express";

import { CashMovement } from "../models/CashMovement.js";
import { CashRegister } from "../models/CashRegister.js";
import { Store } from "../models/Store.js";

import {
    CashMovementType,
    CashRegisterStatus
} from "../types/CashRegister.js";

import { errorHandler } from "../middleware/Error.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

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

export const getAllCashierTransactions = async (
    req: Request,
    res: Response
) => {
    try {
        const { _id: cashier } = res.locals.user;

        const { page, limit, skip } =
            getPagination(req.query);

        /*
         * 1. Obtener la única tienda activa del usuario
         */

        const store = await Store
            .findOne({
                owner: cashier,
                isActive: true
            })
            .select("_id")
            .lean();

        if (!store) {
            res.status(404).json({
                status: "error",
                message: "No se encontró una tienda activa para el usuario"
            });

            return;
        }

        /*
         * 2. Filtrar movimientos realizados por el cajero
         */

        const filter = {
            store: store._id,
            user: cashier
        };

        /*
         * 3. Obtener movimientos y total
         */

        const [transactions, totalTransactions] =
            await Promise.all([
                CashMovement
                    .find(filter)
                    .populate({
                        path: "cashRegister",
                        select:
                            "_id openingAmount closingAmount status openedAt closedAt"
                    })
                    .populate({
                        path: "user",
                        select: "_id name email"
                    })
                    .sort({
                        createdAt: -1
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                CashMovement.countDocuments(filter)
            ]);

        /*
         * 4. Respuesta
         */

        res.status(200).json({
            status: "success",
            data: {
                items: transactions,
                currentPage: page,
                totalPages: getTotalPages(
                    limit,
                    totalTransactions
                )
            }
        });

    } catch (error) {
        errorHandler(
            error,
            req,
            res
        );
    }
};