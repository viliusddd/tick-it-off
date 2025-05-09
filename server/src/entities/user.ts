import {z} from 'zod'
import type {Selectable} from 'kysely'
import type {User} from '@server/database/types'
import {idSchema} from './shared'

const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 33
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 64

export const userSchema = z.object({
  id: idSchema.describe('Unique user identifier'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({message: 'Please enter a valid email address'})
    .describe("User's email address (must be valid)"),

  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    })
    .max(PASSWORD_MAX_LENGTH, {
      message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`
    })
    .describe(`User password (${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters)`),

  firstName: z
    .string()
    .min(NAME_MIN_LENGTH, {message: `First name must be at least ${NAME_MIN_LENGTH} characters`})
    .max(NAME_MAX_LENGTH, {message: `First name must be at most ${NAME_MAX_LENGTH} characters`})
    .describe("User's first name"),
  lastName: z
    .string()
    .min(NAME_MIN_LENGTH, {message: `Last name must be at least ${NAME_MIN_LENGTH} characters`})
    .max(NAME_MAX_LENGTH, {message: `Last name must be at most ${NAME_MAX_LENGTH} characters`})
    .describe("User's last name")
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
