import type { Request, Response } from "express";
import { errorHandler } from "../middleware/Error.js";
import { Store } from "../models/Store.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const createStore = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            phone,
            address
        } = req.body;
        
        const { user } = res.locals;

        const newStore = new Store({
            name,
            description,
            phone,
            address,
            owner: user._id
        });

        await newStore.save();

        res.status(201).json({
            status: "success",
            message: "Tienda creada con éxito",
            data: {
                store: newStore
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getStoreById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const store = await Store
            .findOne({
                _id: id,
                owner: res.locals.user._id,
                isActive: true
            })
            .lean();

        if (store === null) {
            res.status(404).json({
                status: "error",
                message: "Tienda no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            data: {
                store
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getAllStores = async (
    req: Request,
    res: Response
) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const owner = res.locals.user._id;

        const [stores, totalStores] = await Promise.all([
            Store
                .find({
                    owner,
                    isActive: true
                })
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),

            Store.countDocuments({
                owner,
                isActive: true
            })
        ]);

        const totalPages = getTotalPages(
            limit,
            totalStores
        );

        res.status(200).json({
            status: "success",
            data: {
                items: stores,
                currentPage: page,
                totalPages
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const updateStore = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const store = await Store
            .findOneAndUpdate(
                {
                    _id: id,
                    owner: res.locals.user._id,
                    isActive: true
                },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
            .lean();

        if (store === null) {
            res.status(404).json({
                status: "error",
                message: "Tienda no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Tienda actualizada con éxito",
            data: {
                store
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const deleteStore = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const store = await Store.findOneAndUpdate(
            {
                _id: id,
                owner: res.locals.user._id,
                isActive: true
            },
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (store === null) {
            res.status(404).json({
                status: "error",
                message: "Tienda no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Tienda eliminada con éxito"
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};