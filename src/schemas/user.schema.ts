import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string({ error: 'El nombre es requerido' })
    .trim()
    .min(1, { error: 'El nombre debe ser más largo' }),
  lastname: z
    .string({ error: 'El apellido es requerido' })
    .trim()
    .min(1, { error: 'El apellido debe ser más largo' }),
  username: z
    .string({ error: 'El nombre de usuario es requerido' })
    .trim()
    .min(1, { error: 'El nombre de usuario debe ser más largo' }),
  email: z
    .email({ error: "El email debe ser válido"})
    .trim()
    .min(5, { error: "El email debe ser válido"}),
  password: z
    .string({ error: "La contraseña es requerida" })
    .min(8, { error: "La contraseña debe tener almenos 8 caracteres" }),
}).strict()