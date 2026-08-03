import { type Request, type Response, type NextFunction } from 'express'

export const verifyRole = (roles: string[]) => (_req: Request, res: Response, next: NextFunction): void => {
  const role = res.locals.user.role as string

  if (!roles.includes(role)) {
    res.status(401).json({
      message: 'No tienes suficientes permisos para realizar esta acción.'
    })
    return
  }

  next()
}
