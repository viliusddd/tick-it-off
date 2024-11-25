import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { idSchema } from './shared'

export const userSchema = z.object({
  id: idSchema,

  email: z.string().trim().toLowerCase().email().describe('Email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long')
    .describe('8-64 characters long password'),

  firstName: z.string().min(1).max(500).describe('First name'),
  lastName: z.string().min(1).max(500).describe('Last name'),
})

// list keys that we will return to the client
export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ['id', 'firstName', 'lastName', 'email'] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>
export type UserSignup = Omit<User, 'id' | 'createdAt'>

// a specific schema for authenticated user that is used in JWT
export const authUserSchema = userSchema.pick({ id: true })
export type AuthUser = z.infer<typeof authUserSchema>
