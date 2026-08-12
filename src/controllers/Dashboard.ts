import type { Request, Response } from "express";

import { Store } from "../models/Store.js";
import { Sale } from "../models/Sale.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { CashRegister } from "../models/CashRegister.js";

import { SaleStatus } from "../types/Sale.js";
import { CashRegisterStatus } from "../types/CashRegister.js";

import { errorHandler } from "../middleware/Error.js";
import { getCashRegister, getLowStock, getQuickSell, getRecentInventoryMovements, getRecentSales, getSummary } from "../utils/dashboard.js";

export const getDashboard = async (
    req: Request,
    res: Response
) => {
    try {
        const owner = res.locals.user._id;

        const store = await Store.findOne({
            owner,
            isActive: true
        })
            .select("_id name")
            .lean();

        if (!store) {
            res.status(404).json({
                status: "error",
                message: "No se encontró una tienda"
            });

            return;
        }

        const storeId = store._id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [
            summary,
            cashRegister,
            quickSell,
            recentSales,
            recentInventoryMovements,
            lowStock
        ] = await Promise.all([
            getSummary(
                storeId,
                startOfDay,
                endOfDay
            ),

            getCashRegister(storeId),

            getQuickSell(
                storeId,
                owner
            ),

            getRecentSales(storeId),

            getRecentInventoryMovements(storeId),

            getLowStock(storeId)
        ]);

        res.status(200).json({
            status: "success",
            data: {
                summary,
                cashRegister,
                quickSell,
                recentSales,
                recentInventoryMovements,
                lowStock
            }
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

