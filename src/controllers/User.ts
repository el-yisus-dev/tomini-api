import type { Request, Response } from "express";
import { errorHandler } from "../middleware/Error.js";
import { User } from "../models/User.js";
import { getPagination, getTotalPages } from "../utils/pagination.js";

export const createUser = async (req: Request, res: Response) => {
    try {
        
        const { name, lastname, username, email, password } = req.body;

        const newUser = new User({
            name,
            lastname,
            username,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({
            status: "success",
            message: "Usuario creado con éxito"
        })

    } catch (error) {
        errorHandler(error, req, res);
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if(user === undefined || user === null) {
            res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            })
        }

        res.json({
            status: "success",
            data: {
                user
            }
        })

    } catch (error) {
        errorHandler(error, req, res);
    }
}

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query)

    const [users, totalUsers] = await Promise.all([
      User
        .find()
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),
      User.countDocuments()
    ])

    const totalPages = getTotalPages(limit, totalUsers)

    res.status(200).json({
      items: users,
      currentPage: page,
      totalPages
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        errorHandler(error, req, res);
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        errorHandler(error, req, res);
    }
}