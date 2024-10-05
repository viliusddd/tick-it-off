import { z } from 'zod'

export const idSchema = z.number().int().positive()
// export const dateSchema = z.date().default(() => new Date())
export const createdAtSchema = z.date().default(() => new Date())
export const dateSchema = z
  .string()
  .date()
  .default(() => new Date().toLocaleDateString('lt'))
