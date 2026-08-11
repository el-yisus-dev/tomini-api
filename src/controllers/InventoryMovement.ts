import type { Request, Response } from "express";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { Inventory } from "../models/Inventory.js";
import { errorHandler } from "../middleware/Error.js";
import {
    getPagination,
    getTotalPages
} from "../utils/pagination.js";

export const getInventoryMovements = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;
        const { page, limit, skip } = getPagination(req.query);

        const inventory = await Inventory
            .findById(id)
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!inventory || !inventory.store) {
            res.status(404).json({
                status: "error",
                message: "Inventario no encontrado"
            });

            return;
        }

        const filter = {
            store: inventory.store._id,
            productVariant: inventory.productVariant
        };

        const [movements, totalMovements] = await Promise.all([
            InventoryMovement
                .find(filter)
                .populate({
                    path: "user",
                    select: "_id name email"
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            InventoryMovement.countDocuments(filter)
        ]);

        res.status(200).json({
            status: "success",
            data: {
                movements,
                currentPage: page,
                totalPages: getTotalPages(
                    limit,
                    totalMovements
                )
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};