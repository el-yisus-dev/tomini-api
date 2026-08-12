export interface IDashboardSummary {
    salesToday: number;
    transactionsToday: number;
    lowStockCount: number;
}

export interface IDashboardCashRegister {
    id: string;
    status: string;
    openingAmount: number;
    openedAt: Date;
}

export interface IDashboardQuickSell {
    productVariant: string;
    productName: string;
    variantName: string;
    sku: string;
    barcode: string | null;
    salePrice: number;
    unit: string;
    quantity: number;
}

export interface IDashboardRecentSale {
    _id: string;
    total: number;
    paymentMethod: string;
    createdAt: Date;
}

export interface IDashboardInventoryMovement {
    _id: string;
    type: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    productVariant: {
        _id: string;
        productName: string;
        variantName: string;
    };
    createdAt: Date;
}

export interface IDashboardLowStock {
    productVariant: string;
    productName: string;
    variantName: string;
    stock: number;
    minStock: number;
    salePrice: number;
}

export interface IDashboard {
    summary: IDashboardSummary;
    cashRegister: IDashboardCashRegister | null;
    quickSell: IDashboardQuickSell[];
    recentSales: IDashboardRecentSale[];
    recentInventoryMovements: IDashboardInventoryMovement[];
    lowStock: IDashboardLowStock[];
}