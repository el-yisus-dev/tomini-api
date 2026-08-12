import express, { type Router, type Express} from 'express'

import AuthRouter from "./Auth.js";
import CashRegisterRouter from "./CashRegister.js";
import CategoriesRouter from "./Category.js";
import DashboardRouter from "./Dashboard.js";
import InventoryRouter from "./Inventory.js";
import ProductsRouter from "./Product.js";
import SaleRouter from "./Sale.js";
import UserRouter from "./User.js";
import StoreRouter from "./Store.js";

const routerAPI = (app: Express) => {
    
    const router: Router = express.Router()
        
    app.get("/", (req, res) => {
        res.json({
            "status": "exito",
            data: {
                message: "First steps master in the app u.ur"
            }
        })
    })

    app.use("/api/v1", router);
    
    router.use("/auth", AuthRouter);
    router.use("/cash-registers", CashRegisterRouter);
    router.use("/categories", CategoriesRouter);
    router.use("/dashboard", DashboardRouter);
    router.use("/inventory", InventoryRouter);
    router.use("/products", ProductsRouter);
    router.use("/sales", SaleRouter);
    router.use("/store", StoreRouter);
    router.use("/users", UserRouter);
}

export { 
    routerAPI
};