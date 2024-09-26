import { z } from 'zod'

export const idSchema = z.number().int().positive()

export const dateSchema = z
  .union([
    z.date().default(new Date()),
    z.string().date().default(new Date().toLocaleDateString('lt')),
  ])
  .refine((date) => {
    if (typeof date === 'string') {
      const dateObj = new Date(date)
      return !Number.isNaN(dateObj.getTime())
    }
    return true
  })
  .refine((date) => new Date(date) < new Date(), {
    message: 'Future dates are not allowed',
  })
