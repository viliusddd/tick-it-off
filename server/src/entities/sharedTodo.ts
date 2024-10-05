import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { SharedTodo } from '@server/database/types'
import { createdAtSchema, idSchema } from './shared'

export const sharedTodoSchema = z.object({
  userId: idSchema,
  todoId: idSchema,
  createdAt: createdAtSchema,
})

export const sharedTodoIdsSchema = sharedTodoSchema.omit({ createdAt: true })

export const sharedTodoKeysAll = Object.keys(
  sharedTodoSchema.shape
) as (keyof SharedTodo)[]

export const sharedTodoKeysPublic = sharedTodoKeysAll

export type SharedTodoPublic = Pick<
  Selectable<SharedTodo>,
  (typeof sharedTodoKeysPublic)[number]
>
