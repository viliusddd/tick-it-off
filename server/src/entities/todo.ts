import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Todo } from '@server/database/types'
import { createdAtSchema, idSchema } from './shared'

export const todoSchema = z.object({
  id: idSchema,
  userId: idSchema,
  title: z.string().trim().min(1).max(255),
  createdAt: createdAtSchema,
})

export const todoKeysAll = Object.keys(todoSchema.shape) as (keyof Todo)[]

export const todoKeysPublic = todoKeysAll

export type TodoPublic = Pick<Selectable<Todo>, (typeof todoKeysPublic)[number]>
