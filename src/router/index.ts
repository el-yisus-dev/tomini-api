import express, { type Router, type Express} from 'express'

import AuthRouter from "./Auth.js";
import CategoriesRouter from "./Category.js";
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
    router.use("/categories", CategoriesRouter);
    router.use("/store", StoreRouter);
    router.use("/users", UserRouter);
}

export { 
    routerAPI
};