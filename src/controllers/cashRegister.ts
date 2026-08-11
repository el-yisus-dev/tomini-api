import type { Request, Response } from "express";
import mongoose from "mongoose";

import { CashRegister } from "../models/CashRegister.js";
import { CashMovement } from "../models/CashMovement.js";
import { Store } from "../models/Store.js";

import {
    CashMovementType,
    CashRegisterStatus
} from "../types/CashRegister.js";

import { errorHandler } from "../middleware/Error.js";

const getExpectedAmount = async (
    cashRegisterId: mongoose.Types.ObjectId,
    openingAmount: number
): Promise<number> => {
    const [result] = await CashMovement.aggregate([
        {
            $match: {
                cashRegister: cashRegisterId
            }
        },
        {
            $group: {
                _id: null,
                movementTotal: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    "$type",
                                    [
                                        CashMovementType.SALE,
                                        CashMovementType.DEPOSIT
                                    ]
                                ]
                            },
                            "$amount",
                            {
                                $multiply: [
                                    "$amount",
                                    -1
                                ]
                            }
                        ]
                    }
                }
            }
        }
    ]);

    return openingAmount + (result?.movementTotal ?? 0);
};

export const openCashRegister = async (
    req: Request,
    res: Response
) => {
    try {
        const { openingAmount } = req.body;
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

        const existingCashRegister = await CashRegister.exists({
            store: store._id,
            status: CashRegisterStatus.OPEN
        });

        if (existingCashRegister) {
            res.status(409).json({
                status: "error",
                message: "La tienda ya tiene una caja abierta"
            });

            return;
        }

        const cashRegister = await CashRegister.create({
            store: store._id,
            openedBy: owner,
            openingAmount,
            status: CashRegisterStatus.OPEN,
            openedAt: new Date()
        });

        res.status(201).json({
            status: "success",
            message: "Caja abierta correctamente",
            data: cashRegister
        });
    } catch (error) {
        if (
            error instanceof mongoose.Error &&
            "code" in error &&
            error.code === 11000
        ) {
            res.status(409).json({
                status: "error",
                message: "La tienda ya tiene una caja abierta"
            });

            return;
        }

        errorHandler(error, req, res);
    }
};

export const getCurrentCashRegister = async (
    req: Request,
    res: Response
) => {
    try {
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
        })
            .populate({
                path: "openedBy",
                select: "_id name email"
            })
            .lean();

        if (!cashRegister) {
            res.status(404).json({
                status: "error",
                message: "No hay una caja abierta"
            });

            return;
        }

        const expectedAmount = await getExpectedAmount(
            cashRegister._id,
            cashRegister.openingAmount
        );

        res.status(200).json({
            status: "success",
            data: {
                ...cashRegister,
                expectedAmount
            }
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const closeCashRegister = async (
    req: Request,
    res: Response
) => {
    try {
        const { closingAmount } = req.body;
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
        });

        if (!cashRegister) {
            res.status(404).json({
                status: "error",
                message: "No hay una caja abierta"
            });

            return;
        }

        const expectedAmount = await getExpectedAmount(
            cashRegister._id,
            cashRegister.openingAmount
        );

        const difference =
            closingAmount - expectedAmount;

        cashRegister.closingAmount = closingAmount;
        cashRegister.difference = difference;
        cashRegister.status = CashRegisterStatus.CLOSED;
        cashRegister.closedBy = owner;
        cashRegister.closedAt = new Date();

        await cashRegister.save();

        res.status(200).json({
            status: "success",
            message: "Caja cerrada correctamente",
            data: {
                cashRegister,
                expectedAmount
            }
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};
