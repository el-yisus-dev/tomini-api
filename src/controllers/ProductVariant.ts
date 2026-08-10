import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { ProductVariant } from "../models/ProductVariant.js";
import { Store } from "../models/Store.js";
import { errorHandler } from "../middleware/Error.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const createProductVariant = async (
    req: Request,
    res: Response
) => {
    try {
        const { productId } = req.params;

        const {
            name,
            sku,
            barcode,
            purchasePrice,
            salePrice,
            minStock,
            unit,
            quantity
        } = req.body;

        const { _id: owner } = res.locals.user;

        const product = await Product
            .findOne({
                _id: productId,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!product || !product.store) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        const variant = await ProductVariant.create({
            product: productId,
            name,
            sku,
            barcode,
            purchasePrice,
            salePrice,
            minStock,
            unit,
            quantity
        });

        res.status(201).json({
            status: "success",
            message: "Variante creada correctamente",
            data: variant
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getAllProductVariants = async (
    req: Request,
    res: Response
) => {
    try {
        const { productId } = req.params;
        const { _id: owner } = res.locals.user;
        console.log("Id del product", productId);
        console.log("Id del dueño del local", owner);
        const product = await Product
            .findOne({
                _id: productId,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!product || !product.store) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        const { page, limit, skip } = getPagination(req.query);

        const filter = {
            product: productId,
            isActive: true
        };

        const [variants, totalVariants] = await Promise.all([
            ProductVariant
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),

            ProductVariant.countDocuments(filter)
        ]);

        const totalPages = getTotalPages(
            limit,
            totalVariants
        );

        res.status(200).json({
            status: "success",
            data: {
                items: variants,
                currentPage: page,
                totalPages
            }
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const getProductVariantById = async (
    req: Request,
    res: Response
) => {
    try {
        const { productId, variantId } = req.params;
        const { _id: owner } = res.locals.user;

        const product = await Product
            .findOne({
                _id: productId,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!product || !product.store) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        const variant = await ProductVariant
            .findOne({
                _id: variantId,
                product: productId,
                isActive: true
            })
            .lean();

        if (!variant) {
            res.status(404).json({
                status: "error",
                message: "Variante no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            data: variant
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const updateProductVariant = async (
    req: Request,
    res: Response
) => {
    try {
        const { productId, variantId } = req.params;

        const {
            name,
            sku,
            barcode,
            purchasePrice,
            salePrice,
            minStock,
            unit,
            quantity,
            isActive
        } = req.body;

        const { _id: owner } = res.locals.user;

        const product = await Product
            .findOne({
                _id: productId,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!product || !product.store) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        const variant = await ProductVariant
            .findOneAndUpdate(
                {
                    _id: variantId,
                    product: productId,
                    isActive: true
                },
                {
                    name,
                    sku,
                    barcode,
                    purchasePrice,
                    salePrice,
                    minStock,
                    unit,
                    quantity,
                    isActive
                },
                {
                    new: true,
                    runValidators: true
                }
            )
            .lean();

        if (!variant) {
            res.status(404).json({
                status: "error",
                message: "Variante no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Variante actualizada correctamente",
            data: variant
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

export const deleteProductVariant = async (
    req: Request,
    res: Response
) => {
    try {
        const { productId, variantId } = req.params;
        const { _id: owner } = res.locals.user;

        const product = await Product
            .findOne({
                _id: productId,
                isActive: true
            })
            .populate({
                path: "store",
                match: {
                    owner,
                    isActive: true
                },
                select: "_id"
            })
            .lean();

        if (!product || !product.store) {
            res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });

            return;
        }

        const variant = await ProductVariant.findOneAndUpdate(
            {
                _id: variantId,
                product: productId,
                isActive: true
            },
            {
                isActive: false
            }
        );

        if (!variant) {
            res.status(404).json({
                status: "error",
                message: "Variante no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Variante desactivada correctamente"
        });

    } catch (error) {
        errorHandler(error, req, res);
    }
};