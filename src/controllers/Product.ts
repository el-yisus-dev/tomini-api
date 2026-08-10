import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Store } from "../models/Store.js";
import { errorHandler } from "../middleware/Error.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            category,
            store
        } = req.body;

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

        const categoryExists = await Category.exists({
            _id: category,
            store,
            isActive: true
        });

        if (!categoryExists) {
            res.status(404).json({
                status: "error",
                message: "Categoría no encontrada"
            });

            return;
        }

        const product = await Product.create({
            name,
            description,
            category,
            store
        });

        res.status(201).json({
            status: "success",
            message: "Producto creado correctamente",
            data: product
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
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

        const storeIds = stores.map(({ _id }) => _id);

        const filter = {
            store: { $in: storeIds },
            isActive: true
        };

        const [products, totalProducts] = await Promise.all([
            Product
                .find(filter)
                .populate({
                    path: "category",
                    select: "_id name"
                })
                .populate({
                    path: "store",
                    select: "_id name"
                })
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),

            Product.countDocuments(filter)
        ]);

        const totalPages = getTotalPages(
            limit,
            totalProducts
        );

        res.status(200).json({
            status: "success",
            data: {
                items: products,
                currentPage: page,
                totalPages
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        const stores = await Store
            .find({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        const storeIds = stores.map(({ _id }) => _id);

        const product = await Product
            .findOne({
                _id: id,
                store: { $in: storeIds },
                isActive: true
            })
            .populate({
                path: "category",
                select: "_id name description"
            })
            .populate({
                path: "store",
                select: "_id name"
            })
            .lean();

        if (!product) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            data: product
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const { _id: owner } = res.locals.user;

        const stores = await Store
            .find({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        const storeIds = stores.map(({ _id }) => _id);

        const product = await Product
            .findOneAndUpdate(
                {
                    _id: id,
                    store: { $in: storeIds },
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

        if (!product) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Producto actualizado correctamente",
            data: product
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        const stores = await Store
            .find({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        const storeIds = stores.map(({ _id }) => _id);

        const product = await Product.findOneAndUpdate(
            {
                _id: id,
                store: { $in: storeIds },
                isActive: true
            },
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!product) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Producto desactivado correctamente"
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};