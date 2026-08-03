import { z } from "zod";

// Only valid to mongoIds
export const objectIdSchema = z.object({
  id: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Id invalido"),
});