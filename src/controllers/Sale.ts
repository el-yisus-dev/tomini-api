import type { Request, Response } from "express";
import mongoose from "mongoose";

import { Store } from "../models/Store.js";
import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";
import { ProductVariant } from "../models/ProductVariant.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { CashRegister } from "../models/CashRegister.js";
import { CashMovement } from "../models/CashMovement.js";


import {
    getPagination,
    getTotalPages
} from "../utils/pagination.js";


import {
    PaymentMethod,
    SaleStatus
} from "../types/Sale.js";

import {
    CashMovementType,
    CashRegisterStatus
} from "../types/CashRegister.js";

import {
    InventoryMovementType
} from "../types/InventoryMovement.js";

import { errorHandler } from "../middleware/Error.js";

export const createSale = async (
    req: Request,
    res: Response
) => {
    const session = await mongoose.startSession();

    try {
        const {
            items,
            discount = 0,
            paymentMethod,
            amountPaid
        } = req.body;

        const { _id: cashier } = res.locals.user;

        let sale;

        let businessError: string | null = null;

        await session.withTransaction(async () => {

            /*
             * 1. Obtener la única tienda activa del administrador
             */

            const store = await Store
                .findOne({
                    owner: cashier,
                    isActive: true
                })
                .select("_id")
                .session(session)
                .lean();

            if (!store) {
                businessError =
                    "No se encontró una tienda activa para el usuario";

                return;
            }

            /*
             * 2. Verificar que exista una caja abierta
             */

            const cashRegister = await CashRegister
                .findOne({
                    store: store._id,
                    status: CashRegisterStatus.OPEN
                })
                .session(session);

            if (!cashRegister) {
                businessError =
                    "No hay una caja abierta para realizar la venta";

                return;
            }

            /*
             * 3. Validar que existan productos en la venta
             */

            if (!items || items.length === 0) {
                businessError =
                    "La venta debe contener al menos un producto";

                return;
            }

            /*
             * 4. Evitar variantes repetidas
             */

            const variantIds = items.map(
                (item: {
                    productVariant: string;
                    quantity: number;
                }) => item.productVariant
            );

            const uniqueVariantIds = new Set(
                variantIds
            );

            if (
                uniqueVariantIds.size !==
                variantIds.length
            ) {
                businessError =
                    "No se puede agregar la misma variante más de una vez en una venta";

                return;
            }

            /*
             * 5. Obtener variantes
             */

            const variants = await ProductVariant
                .find({
                    _id: {
                        $in: variantIds
                    },
                    isActive: true
                })
                .lean()
                .session(session);

            if (
                variants.length !==
                variantIds.length
            ) {
                businessError =
                    "Una o más variantes del producto no existen o están inactivas";

                return;
            }

            /*
             * 6. Obtener productos
             */

            const productIds = variants.map(
                variant => variant.product
            );

            const products = await Product
                .find({
                    _id: {
                        $in: productIds
                    },
                    store: store._id,
                    isActive: true
                })
                .select("_id name")
                .lean()
                .session(session);

            const productMap = new Map(
                products.map(product => [
                    product._id.toString(),
                    product
                ])
            );

            /*
             * 7. Verificar que todas las variantes
             * pertenezcan a productos válidos
             */

            const invalidProduct = variants.some(
                variant =>
                    !productMap.has(
                        variant.product.toString()
                    )
            );

            if (invalidProduct) {
                businessError =
                    "Uno o más productos no existen, están inactivos o no pertenecen a la tienda";

                return;
            }

            /*
             * 8. Obtener inventarios
             */

            const inventories = await Inventory
                .find({
                    store: store._id,
                    productVariant: {
                        $in: variantIds
                    }
                })
                .session(session);

            const inventoryMap = new Map(
                inventories.map(inventory => [
                    inventory.productVariant.toString(),
                    inventory
                ])
            );

            /*
             * 9. Validar inventarios
             */

            const missingInventory = variantIds.find(
                variantId =>
                    !inventoryMap.has(variantId)
            );

            if (missingInventory) {
                businessError =
                    "Una o más variantes no tienen un registro de inventario";

                return;
            }

            /*
             * 10. Construir items y validar stock
             */

            const saleItems = items.map(
                (item: {
                    productVariant: string;
                    quantity: number;
                }) => {

                    const variant = variants.find(
                        currentVariant =>
                            currentVariant._id.toString() ===
                            item.productVariant
                    );

                    if (!variant) {
                        return null;
                    }

                    const product = productMap.get(
                        variant.product.toString()
                    );

                    if (!product) {
                        return null;
                    }

                    const inventory =
                        inventoryMap.get(
                            item.productVariant
                        );

                    if (!inventory) {
                        return null;
                    }

                    if (
                        inventory.stock <
                        item.quantity
                    ) {
                        return null;
                    }

                    const subtotal =
                        variant.salePrice *
                        item.quantity;

                    const previousStock =
                        inventory.stock;

                    const newStock =
                        previousStock -
                        item.quantity;

                    inventory.stock =
                        newStock;

                    return {
                        product: product._id,
                        productVariant: variant._id,

                        name: product.name,
                        sku: variant.sku ?? null,

                        quantity: item.quantity,
                        unitPrice: variant.salePrice,
                        subtotal,

                        inventory,
                        previousStock,
                        newStock
                    };
                }
            );

            /*
             * 11. Identificar errores específicos
             */

            const invalidItem =
                saleItems.find(
                    item => item === null
                );

            if (invalidItem === null) {
                const invalidItemIndex =
                    saleItems.findIndex(
                        item => item === null
                    );

                businessError =
                    `El producto de la posición ${invalidItemIndex + 1} no es válido`;

                return;
            }

            /*
             * TypeScript puede tratar los items
             * como válidos después de la validación.
             */

            const validSaleItems =
                saleItems as NonNullable<
                    typeof saleItems[number]
                >[];

            /*
             * 12. Validar stock insuficiente
             */

            const insufficientStockItem =
                items.find(item => {

                    const inventory =
                        inventoryMap.get(
                            item.productVariant
                        );

                    return (
                        inventory &&
                        inventory.stock < item.quantity
                    );
                });

            if (insufficientStockItem) {

                const variant =
                    variants.find(
                        currentVariant =>
                            currentVariant._id.toString() ===
                            insufficientStockItem.productVariant
                    );

                const inventory =
                    inventoryMap.get(
                        insufficientStockItem.productVariant
                    );

                businessError =
                    `Stock insuficiente para "${variant?.name ?? "producto"}". Disponible: ${inventory?.stock ?? 0}, solicitado: ${insufficientStockItem.quantity}`;

                return;
            }

            /*
             * 13. Calcular subtotal
             */

            const subtotal =
                validSaleItems.reduce(
                    (total, item) =>
                        total + item.subtotal,
                    0
                );

            /*
             * 14. Validar descuento
             */

            if (discount < 0) {
                businessError =
                    "El descuento no puede ser negativo";

                return;
            }

            if (discount > subtotal) {
                businessError =
                    "El descuento no puede ser mayor al subtotal de la venta";

                return;
            }

            /*
             * 15. Calcular total
             */

            const total =
                subtotal - discount;

            /*
             * 16. Validar monto recibido
             */

            if (amountPaid < 0) {
                businessError =
                    "El monto recibido no puede ser negativo";

                return;
            }

            /*
             * 17. Validar pago en efectivo
             */

            if (
                paymentMethod ===
                PaymentMethod.CASH
            ) {

                if (amountPaid < total) {
                    businessError =
                        `El monto recibido es insuficiente. Total: $${total.toFixed(2)}, recibido: $${amountPaid.toFixed(2)}`;

                    return;
                }
            }

            /*
             * 18. Validar pagos electrónicos
             */

            if (
                paymentMethod !==
                PaymentMethod.CASH
            ) {

                if (amountPaid !== total) {
                    businessError =
                        `El monto pagado debe ser exactamente igual al total de la venta: $${total.toFixed(2)}`;

                    return;
                }
            }

            /*
             * 19. Calcular cambio
             */

            const change =
                paymentMethod ===
                PaymentMethod.CASH
                    ? amountPaid - total
                    : 0;

            /*
             * 20. Actualizar inventarios
             */

            await Promise.all(
                validSaleItems.map(item =>
                    item.inventory.save({
                        session
                    })
                )
            );

            /*
             * 21. Crear venta
             */

            [sale] = await Sale.create(
                [
                    {
                        store: store._id,
                        cashRegister:
                            cashRegister._id,
                        cashier,

                        items: validSaleItems.map(
                            ({
                                inventory,
                                previousStock,
                                newStock,
                                ...saleItem
                            }) => saleItem
                        ),

                        subtotal,
                        discount,
                        total,

                        paymentMethod,
                        amountPaid,
                        change,

                        status:
                            SaleStatus.COMPLETED
                    }
                ],
                {
                    session
                }
            );

            /*
             * 22. Registrar movimientos de inventario
             */

            await InventoryMovement.insertMany(
                validSaleItems.map(item => ({
                    store: store._id,
                    productVariant:
                        item.productVariant,
                    user: cashier,

                    type:
                        InventoryMovementType.SALE,

                    quantity:
                        -item.quantity,

                    previousStock:
                        item.previousStock,

                    newStock:
                        item.newStock,

                    reason:
                        `Venta ${sale._id}`
                })),
                {
                    session
                }
            );

            /*
             * 23. Registrar movimiento de caja
             *
             * Solo CASH afecta el efectivo físico.
             */

            if (
                paymentMethod ===
                PaymentMethod.CASH
            ) {

                await CashMovement.create(
                    [
                        {
                            store: store._id,

                            cashRegister:
                                cashRegister._id,

                            user: cashier,

                            type:
                                CashMovementType.SALE,

                            amount: total,

                            reference:
                                sale._id
                        }
                    ],
                    {
                        session
                    }
                );
            }
        });

        /*
         * 24. Devolver error de negocio
         */

        if (businessError) {
            res.status(400).json({
                status: "error",
                message: businessError
            });

            return;
        }

        /*
         * 25. Verificación de seguridad
         */

        if (!sale) {
            res.status(500).json({
                status: "error",
                message:
                    "No fue posible completar la venta"
            });

            return;
        }

        /*
         * 26. Respuesta exitosa
         */

        res.status(201).json({
            status: "success",
            message: "Venta creada correctamente",
            data: sale
        });

    } catch (error) {

        errorHandler(
            error,
            req,
            res
        );

    } finally {

        await session.endSession();
    }
};

export const getAllSales = async (
    req: Request,
    res: Response
) => {
    try {
        const { _id: owner } = res.locals.user;

        const {
            page,
            limit,
            skip
        } = getPagination(req.query);

        /*
         * Obtener la tienda activa del admin.
         */

        const store = await Store
            .findOne({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        if (!store) {
            res.status(404).json({
                status: "error",
                message: "No se encontró una tienda activa"
            });

            return;
        }

        /*
         * Filtros.
         *
         * Por ahora permitimos filtrar por:
         * - status
         * - paymentMethod
         */

        const filter: {
            store: mongoose.Types.ObjectId;
            status?: SaleStatus;
            paymentMethod?: PaymentMethod;
        } = {
            store: store._id
        };

        if (
            typeof req.query.status === "string"
        ) {
            if (
                !Object.values(SaleStatus).includes(
                    req.query.status as SaleStatus
                )
            ) {
                res.status(400).json({
                    status: "error",
                    message: "El estado de la venta no es válido"
                });

                return;
            }

            filter.status =
                req.query.status as SaleStatus;
        }

        if (
            typeof req.query.paymentMethod === "string"
        ) {
            if (
                !Object.values(PaymentMethod).includes(
                    req.query.paymentMethod as PaymentMethod
                )
            ) {
                res.status(400).json({
                    status: "error",
                    message: "El método de pago no es válido"
                });

                return;
            }

            filter.paymentMethod =
                req.query.paymentMethod as PaymentMethod;
        }

        const [
            sales,
            totalSales
        ] = await Promise.all([
            Sale
                .find(filter)
                .populate({
                    path: "cashier",
                    select: "_id name email"
                })
                .populate({
                    path: "cashRegister",
                    select:
                        "_id openingAmount closingAmount difference status openedAt closedAt"
                })
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            Sale.countDocuments(filter)
        ]);

        res.status(200).json({
            status: "success",
            data: {
                items: sales,
                currentPage: page,
                totalPages: getTotalPages(
                    limit,
                    totalSales
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

export const getSaleById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { _id: owner } = res.locals.user;

        /*
         * Obtener la tienda activa del admin.
         */

        const store = await Store
            .findOne({
                owner,
                isActive: true
            })
            .select("_id")
            .lean();

        if (!store) {
            res.status(404).json({
                status: "error",
                message: "No se encontró una tienda activa"
            });

            return;
        }

        /*
         * Buscar la venta dentro de la tienda.
         */

        const sale = await Sale
            .findOne({
                _id: id,
                store: store._id
            })
            .populate({
                path: "cashier",
                select: "_id name email"
            })
            .populate({
                path: "cashRegister",
                select:
                    "_id openingAmount closingAmount difference status openedAt closedAt"
            })
            .populate({
                path: "items.product",
                select: "_id name"
            })
            .populate({
                path: "items.productVariant",
                select:
                    "_id name sku barcode unit quantity"
            })
            .lean();

        if (!sale) {
            res.status(404).json({
                status: "error",
                message: "Venta no encontrada"
            });

            return;
        }

        res.status(200).json({
            status: "success",
            data: sale
        });

    } catch (error) {
        errorHandler(
            error,
            req,
            res
        );
    }
};

export const cancelSale = async (
    req: Request,
    res: Response
) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const { _id: user } = res.locals.user;

        let sale;
        let businessError: string | null = null;
        let businessStatus = 400;

        await session.withTransaction(async () => {

            /*
             * 1. Obtener la tienda activa
             */

            const store = await Store
                .findOne({
                    owner: user,
                    isActive: true
                })
                .select("_id")
                .session(session)
                .lean();

            if (!store) {
                businessStatus = 404;
                businessError =
                    "No se encontró una tienda activa para el usuario";

                return;
            }

            /*
             * 2. Buscar la venta
             */

            const existingSale =
                await Sale
                    .findOne({
                        _id: id,
                        store: store._id
                    })
                    .session(session);

            if (!existingSale) {
                businessStatus = 404;
                businessError =
                    "La venta no existe o no pertenece a la tienda";

                return;
            }

            /*
             * 3. Verificar estado
             */

            if (
                existingSale.status ===
                SaleStatus.CANCELLED
            ) {
                businessStatus = 409;
                businessError =
                    "La venta ya se encuentra cancelada";

                return;
            }

            /*
             * 4. Buscar caja abierta
             *
             * La cancelación modifica el efectivo físico
             * cuando la venta fue pagada en efectivo.
             */

            const cashRegister =
                await CashRegister
                    .findOne({
                        _id: existingSale.cashRegister,
                        store: store._id,
                        status:
                            CashRegisterStatus.OPEN
                    })
                    .session(session);

            if (!cashRegister) {
                businessStatus = 409;
                businessError =
                    "La caja asociada a la venta no está abierta";

                return;
            }

            /*
             * 5. Obtener inventarios
             */

            const variantIds =
                existingSale.items.map(
                    item =>
                        item.productVariant
                );

            const inventories =
                await Inventory
                    .find({
                        store: store._id,
                        productVariant: {
                            $in: variantIds
                        }
                    })
                    .session(session);

            /*
             * 6. Crear mapa de inventarios
             */

            const inventoryMap =
                new Map(
                    inventories.map(
                        inventory => [
                            inventory.productVariant.toString(),
                            inventory
                        ]
                    )
                );

            /*
             * 7. Verificar inventarios faltantes
             */

            const missingItem =
                existingSale.items.find(
                    item =>
                        !inventoryMap.has(
                            item.productVariant.toString()
                        )
                );

            if (missingItem) {
                businessStatus = 404;
                businessError =
                    `No se encontró el inventario de la variante ${missingItem.productVariant}`;

                return;
            }

            /*
             * 8. Preparar movimientos de inventario
             */

            const inventoryMovements =
                existingSale.items.map(item => {

                    const inventory =
                        inventoryMap.get(
                            item.productVariant.toString()
                        );

                    if (!inventory) {
                        return null;
                    }

                    const previousStock =
                        inventory.stock;

                    const newStock =
                        previousStock +
                        item.quantity;

                    inventory.stock =
                        newStock;

                    return {
                        store: store._id,

                        productVariant:
                            item.productVariant,

                        user,

                        type:
                            InventoryMovementType.CANCELLATION,

                        quantity:
                            item.quantity,

                        previousStock,

                        newStock,

                        reason:
                            `Cancelación de venta ${existingSale._id}`
                    };
                });

            /*
             * 9. Verificación de seguridad
             */

            const invalidMovement =
                inventoryMovements.some(
                    movement =>
                        movement === null
                );

            if (invalidMovement) {
                businessStatus = 500;
                businessError =
                    "No fue posible preparar los movimientos de inventario";

                return;
            }

            const validInventoryMovements =
                inventoryMovements as NonNullable<
                    typeof inventoryMovements[number]
                >[];

            /*
             * 10. Guardar inventarios
             */

            await Promise.all(
                inventories.map(
                    inventory =>
                        inventory.save({
                            session
                        })
                )
            );

            /*
             * 11. Registrar movimientos de inventario
             */

            await InventoryMovement.insertMany(
                validInventoryMovements,
                {
                    session
                }
            );

            /*
             * 12. Si fue efectivo,
             *     registrar devolución de dinero
             */

            if (
                existingSale.paymentMethod ===
                PaymentMethod.CASH
            ) {
                await CashMovement.create(
                    [
                        {
                            store: store._id,

                            cashRegister:
                                cashRegister._id,

                            user,

                            type:
                                CashMovementType.REFUND,

                            amount:
                                existingSale.total,

                            reason:
                                `Cancelación de venta ${existingSale._id}`,

                            reference:
                                existingSale._id
                        }
                    ],
                    {
                        session
                    }
                );
            }

            /*
             * 13. Cambiar estado de la venta
             */

            existingSale.status =
                SaleStatus.CANCELLED;

            await existingSale.save({
                session
            });

            sale = existingSale;
        });

        /*
         * 14. Error de negocio
         */

        if (businessError) {
            res.status(businessStatus).json({
                status: "error",
                message: businessError
            });

            return;
        }

        /*
         * 15. Verificación de seguridad
         */

        if (!sale) {
            res.status(500).json({
                status: "error",
                message:
                    "No fue posible cancelar la venta"
            });

            return;
        }

        /*
         * 16. Respuesta
         */

        res.status(200).json({
            status: "success",
            message:
                "Venta cancelada correctamente",
            data: sale
        });

    } catch (error) {

        errorHandler(
            error,
            req,
            res
        );

    } finally {

        await session.endSession();
    }
};