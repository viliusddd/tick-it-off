import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Completion } from '@server/database/types'
import { createdAtSchema, idSchema } from './shared'

const POSTGRES_INT_MAX = 2147483647

export const completionSchema = z.object({
  todoId: idSchema,
  date: z.string(),
  createdAt: createdAtSchema,
})

export const completionPaginationSchema = z.object({
  date: z.string().default(new Date().toLocaleDateString('lt')),
  offset: z.number().int().min(0).max(POSTGRES_INT_MAX).default(0),
  limit: z.number().int().min(1).max(100).default(20),
})

export const completionKeysAll = Object.keys(
  completionSchema.shape
) as (keyof Completion)[]

export const completionKeysPublic = completionKeysAll

export type CompletionPublic = Pick<
  Selectable<Completion>,
  (typeof completionKeysPublic)[number]
>
