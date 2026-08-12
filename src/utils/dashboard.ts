
/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

import { CashRegister } from "../models/CashRegister.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { Sale } from "../models/Sale.js";
import { CashRegisterStatus } from "../types/CashRegister.js";
import { SaleStatus } from "../types/Sale.js";

export const getSummary = async (
    storeId: any,
    startOfDay: Date,
    endOfDay: Date
) => {
    const [sales, lowStock] = await Promise.all([
        Sale.aggregate([
            {
                $match: {
                    store: storeId,
                    status: SaleStatus.COMPLETED,
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    salesToday: {
                        $sum: "$total"
                    },
                    transactionsToday: {
                        $sum: 1
                    }
                }
            }
        ]),

        Inventory.aggregate([
            {
                $match: {
                    store: storeId
                }
            },
            {
                $lookup: {
                    from: "productvariants",
                    localField: "productVariant",
                    foreignField: "_id",
                    as: "variant"
                }
            },
            {
                $unwind: "$variant"
            },
            {
                $match: {
                    "variant.isActive": true
                }
            },
            {
                $match: {
                    $expr: {
                        $lte: [
                            "$stock",
                            "$variant.minStock"
                        ]
                    }
                },
            },
            {
                $count: "count"
            }
        ])
    ]);

    return {
        salesToday: sales[0]?.salesToday ?? 0,
        transactionsToday:
            sales[0]?.transactionsToday ?? 0,
        lowStockCount:
            lowStock[0]?.count ?? 0
    };
};


/*
|--------------------------------------------------------------------------
| Cash Register
|--------------------------------------------------------------------------
*/

export const getCashRegister = async (
    storeId: any
) => {
    const cashRegister = await CashRegister.findOne({
        store: storeId,
        status: CashRegisterStatus.OPEN
    })
        .select(
            "_id status openingAmount openedAt"
        )
        .lean();

    if (!cashRegister) {
        return null;
    }

    return {
        id: cashRegister._id,
        status: cashRegister.status,
        openingAmount: cashRegister.openingAmount,
        openedAt: cashRegister.openedAt
    };
};

/*
|--------------------------------------------------------------------------
| Quick Sell
|--------------------------------------------------------------------------
|
| Obtiene las últimas 6 variantes DISTINTAS que
| el usuario actual ha vendido.
|
| El precio viene de ProductVariant actual,
| no del precio histórico de Sale.items.
|
*/

export const getQuickSell = async (
    storeId: any,
    userId: any
) => {
    return Sale.aggregate([
        {
            $match: {
                store: storeId,
                cashier: userId,
                status: SaleStatus.COMPLETED
            }
        },

        {
            $unwind: "$items"
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $group: {
                _id: "$items.productVariant",
                lastSoldAt: {
                    $first: "$createdAt"
                }
            }
        },

        {
            $lookup: {
                from: "productvariants",
                localField: "_id",
                foreignField: "_id",
                as: "variant"
            }
        },

        {
            $unwind: "$variant"
        },

        {
            $match: {
                "variant.isActive": true
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "variant.product",
                foreignField: "_id",
                as: "product"
            }
        },

        {
            $unwind: "$product"
        },

        {
            $match: {
                "product.isActive": true,
                "product.store": storeId
            }
        },

        {
            $sort: {
                lastSoldAt: -1
            }
        },

        {
            $limit: 6
        },

        {
            $project: {
                _id: 0,

                productVariant: "$variant._id",

                productName: "$product.name",

                variantName: "$variant.name",

                sku: "$variant.sku",

                barcode: "$variant.barcode",

                salePrice: "$variant.salePrice",

                unit: "$variant.unit",

                quantity: "$variant.quantity"
            }
        }
    ]);
};

/*
|--------------------------------------------------------------------------
| Recent Sales
|--------------------------------------------------------------------------
*/

export const getRecentSales = async (
    storeId: any
) => {
    return Sale.find({
        store: storeId,
        status: SaleStatus.COMPLETED
    })
        .select(
            "_id total paymentMethod createdAt"
        )
        .sort({
            createdAt: -1
        })
        .limit(10)
        .lean();
};

/*
|--------------------------------------------------------------------------
| Recent Inventory Movements
|--------------------------------------------------------------------------
*/

export const getRecentInventoryMovements = async (
    storeId: any
) => {
    const movements = await InventoryMovement.find({
        store: storeId
    })
        .select(
            "_id type quantity previousStock newStock productVariant createdAt"
        )
        .populate({
            path: "productVariant",
            select: "name product",
            populate: {
                path: "product",
                select: "name"
            }
        })
        .sort({
            createdAt: -1
        })
        .limit(10)
        .lean();

    return movements.map((movement: any) => ({
        _id: movement._id,

        type: movement.type,

        quantity: movement.quantity,

        previousStock: movement.previousStock,

        newStock: movement.newStock,

        productVariant: {
            _id: movement.productVariant?._id,

            productName:
                movement.productVariant?.product?.name ??
                "Producto no disponible",

            variantName:
                movement.productVariant?.name ??
                "Variante no disponible"
        },

        createdAt: movement.createdAt
    }));
};

/*
|--------------------------------------------------------------------------
| Low Stock
|--------------------------------------------------------------------------
*/

export const getLowStock = async (
    storeId: any
) => {
    return Inventory.aggregate([
        {
            $match: {
                store: storeId
            }
        },

        {
            $lookup: {
                from: "productvariants",
                localField: "productVariant",
                foreignField: "_id",
                as: "variant"
            }
        },

        {
            $unwind: "$variant"
        },

        {
            $match: {
                "variant.isActive": true
            }
        },

        {
            $match: {
                $expr: {
                    $lte: [
                        "$stock",
                        "$variant.minStock"
                    ]
                }
            }
        },

        {
            $lookup: {
                from: "products",
                localField: "variant.product",
                foreignField: "_id",
                as: "product"
            }
        },

        {
            $unwind: "$product"
        },

        {
            $match: {
                "product.isActive": true,
                "product.store": storeId
            }
        },

        {
            $sort: {
                stock: 1
            }
        },

        {
            $limit: 5
        },

        {
            $project: {
                _id: 0,

                productVariant: "$productVariant",

                productName: "$product.name",

                variantName: "$variant.name",

                stock: "$stock",

                minStock: "$variant.minStock",

                salePrice: "$variant.salePrice"
            }
        }
    ]);
};