import {z} from 'zod'
import type {Selectable} from 'kysely'
import type {User} from '@server/database/types'
import {idSchema, emailSchema, passwordSchema, nameSchema} from './shared'

export const userSchema = z.object({
  id: idSchema.describe('Unique user identifier'),
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema
})

// list keys that we will return to the client
export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ['id', 'firstName', 'lastName', 'email'] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>
export type UserSignup = Omit<User, 'id' | 'createdAt'>
export type UserPassword = Pick<User, 'id' | 'password'>

// a specific schema for authenticated user that is used in JWT
export const authUserSchema = userSchema.pick({id: true})
export type AuthUser = z.infer<typeof authUserSchema>

export const userPasswordChangeSchema = z.object({
  oldPassword: z.string().describe('Current password'),
  newPassword: userSchema.shape.password
})
