import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Store } from "../models/Store.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { errorHandler } from "../middleware/Error.js";
import { InventoryMovementType } from "../types/InventoryMovement.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const getAllInventory = async (
    req: Request,
    res: Response
) => {
    try {
        const { _id: owner } = res.locals.user;
        const { page, limit, skip } = getPagination(req.query);

        const stores = await Store
            .find({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        const storeIds = stores.map(store => store._id);

        const filter = {
            store: { $in: storeIds }
        };

        const [inventory, totalInventory] = await Promise.all([
            Inventory
                .find(filter)
                .populate({
                    path: "productVariant",
                    select: "_id name sku barcode unit quantity product"
                })
                .populate({
                    path: "store",
                    select: "_id name"
                })
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),

            Inventory.countDocuments(filter)
        ]);

        res.status(200).json({
            status: "success",
            data: {
                inventory,
                currentPage: page,
                totalPages: getTotalPages(
                    limit,
                    totalInventory
                )
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getInventoryById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        const inventory = await Inventory
            .findById(id)
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id name"
            })
            .populate({
                path: "productVariant",
                select: "_id name sku barcode unit quantity product"
            })
            .lean();

        if (!inventory || !inventory.store) {
            res.status(404).json({
                status: "error",
                message: "Inventario no encontrado"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            data: inventory
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const adjustInventory = async (
    req: Request,
    res: Response
) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;
        const { _id: user } = res.locals.user;

        let inventory;
        let movement;

        await session.withTransaction(async () => {
            inventory = await Inventory
                .findById(id)
                .populate({
                    path: "store",
                    select: "_id owner isActive"
                })
                .session(session);

            if (
                !inventory ||
                !inventory.store ||
                !inventory.store.isActive ||
                inventory.store.owner.toString() !== user.toString()
            ) {
                return;
            }

            const previousStock = inventory.stock;
            const newStock = previousStock + quantity;

            if (newStock < 0) {
                return;
            }

            inventory.stock = newStock;

            await inventory.save({ session });

            [movement] = await InventoryMovement.create(
                [
                    {
                        store: inventory.store._id,
                        productVariant: inventory.productVariant,
                        user,
                        type: quantity < 0 ? InventoryMovementType.DAMAGE : InventoryMovementType.ADJUSTMENT,
                        quantity,
                        previousStock,
                        newStock,
                        reason: reason ?? null
                    }
                ],
                { session }
            );
        });

        if (!inventory) {
            res.status(404).json({
                status: "error",
                message: "Inventario no encontrado"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Inventario ajustado correctamente",
            data: {
                inventory,
                movement
            }
        });

    } catch (error) {
        errorHandler(error, req, res);

    } finally {
        await session.endSession();
    }
};

