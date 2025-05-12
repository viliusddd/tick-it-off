import {z} from 'zod'

const POSTGRES_INT_MAX = 2147483647

export const idSchema = z.number().int().positive().describe('ID number.')

export const userIdSchema = idSchema.describe('User id number.')

export const createdAtSchema = z.date().default(() => new Date())

export const dateSchema = z
  .string()
  .date()
  .default(() => new Date().toLocaleDateString('lt'))
  .describe('Date in ISO 8601 format, for example, 2024-10-02.')

export const offsetSchema = z
  .number()
  .int()
  .min(0)
  .max(POSTGRES_INT_MAX)
  .default(0)
  .describe('Indicates the starting point. Default: 0')

export const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(20)
  .describe('Specifies the maximum number of items to retrieve. Default: 20')
