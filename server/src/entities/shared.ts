import { z } from 'zod'

export const idSchema = z.number().int().positive()
export const dateSchema = z
  .string()
  .date()
  .default(() => new Date().toLocaleDateString('lt'))
