import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Todo } from '@server/database/types'
import { dateSchema, idSchema } from './shared'

export const todoSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1).max(255),
  createdAt: dateSchema,
})

export const todoKeysAll = Object.keys(todoSchema.shape) as (keyof Todo)[]

export const todoKeysPublic = todoKeysAll

export type TodoPublic = Pick<Selectable<Todo>, (typeof todoKeysPublic)[number]>
