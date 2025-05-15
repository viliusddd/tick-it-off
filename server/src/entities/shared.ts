import {z} from 'zod'

const POSTGRES_INT_MAX = 2147483647

const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 33
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 64

export const idSchema = z.number().int().positive().describe('ID number.')

export const userIdSchema = idSchema.describe('User id number.')

export const createdAtSchema = z.date().default(() => new Date())

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({message: 'Please enter a valid email address'})
  .describe("User's email address (must be valid)")

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
  })
  .max(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`
  })
  .describe(`User password (${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters)`)

export const nameSchema = z
  .string()
  .min(NAME_MIN_LENGTH, {message: `First name must be at least ${NAME_MIN_LENGTH} characters`})
  .max(NAME_MAX_LENGTH, {message: `First name must be at most ${NAME_MAX_LENGTH} characters`})
  .describe("User's first name")

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
