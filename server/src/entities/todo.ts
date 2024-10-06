import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Todo } from '@server/database/types'
import { createdAtSchema, idSchema, userIdSchema } from './shared'

export const todoSchema = z.object({
  id: idSchema.describe('Todo id number.'),
  userId: userIdSchema.describe('User id number.'),
  title: z.string().trim().min(1).max(255).describe('Todo item title.'),
  createdAt: createdAtSchema.describe('Date of the todo item creation.'),
})

export const todoKeysAll = Object.keys(todoSchema.shape) as (keyof Todo)[]

export const todoKeysPublic = todoKeysAll

export type TodoPublic = Pick<Selectable<Todo>, (typeof todoKeysPublic)[number]>
