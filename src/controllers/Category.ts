import type { Request, Response } from "express";

import { Category } from "../models/Category.js";
import { Store } from "../models/Store.js";
import { errorHandler } from "../middleware/Error.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, store } = req.body;
        const { _id: owner } = res.locals.user;

        const storeExists = await Store.exists({
            _id: store,
            owner,
            isActive: true
        });

        if (!storeExists) {
            res.status(404).json({
                status: "error",
                message: "Tienda no encontrada"
            });

            return;
        }

        const category = await Category.create({
            name,
            description,
            store
        });

        res.status(201).json({
            status: "success",
            message: "Categoría creada correctamente",
            data: category
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};


export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const { store } = req.query;
        const { _id: owner } = res.locals.user;

        const {
            page,
            limit,
            skip
        } = getPagination(req.query);

        const stores = await Store
            .find({
                owner,
                isActive: true,
                ...(store ? { _id: store } : {})
            })
            .select("_id")
            .lean();

        const storeIds = stores.map(({ _id }) => _id);

        const filter = {
            store: { $in: storeIds },
            isActive: true
        };

        const [categories, totalCategories] = await Promise.all([
            Category
                .find(filter)
                .populate({
                    path: "store",
                    match: {
                        owner,
                        isActive: true
                    },
                    select: "_id name"
                })
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),

            Category.countDocuments(filter)
        ]);

        const totalPages = getTotalPages(
            limit,
            totalCategories
        );

        res.status(200).json({
            status: "success",
            message: "Categorías obtenidas correctamente",
            data: {
                items: categories,
                currentPage: page,
                totalPages,
                totalItems: totalCategories
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};


export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        const category = await Category
            .findOne({
                _id: id,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id name"
            })
            .lean();

        if (!category || !category.store) {
            res.status(404).json({
                status: "error",
                message: "Categoría no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Categoría obtenida correctamente",
            data: category
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};


export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, store } = req.body;
        const { user } = res.locals;

        const storeExists = await Store.exists({
            _id: store,
            owner: user._id,
            isActive: true
        });

        if (!storeExists) {
            res.status(404).json({
                status: "error",
                message: "Tienda no encontrada"
            });

            return;
        }

        const category = await Category
            .findOneAndUpdate(
                {
                    _id: id,
                    store,
                    isActive: true
                },
                {
                    name,
                    description
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            .lean();

        if (!category) {
            res.status(404).json({
                status: "error",
                message: "Categoría no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Categoría actualizada correctamente",
            data: category
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};


export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        const category = await Category
            .findOne({
                _id: id,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            });

        if (!category || !category.store) {
            res.status(404).json({
                status: "error",
                message: "Categoría no encontrada"
            });

            return;
        }

        category.isActive = false;

        await category.save();

        res.status(200).json({
            status: "success",
            message: "Categoría desactivada correctamente"
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};