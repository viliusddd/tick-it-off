import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Completion } from '@server/database/types'
import { dateSchema, createdAtSchema, idSchema } from './shared'

const POSTGRES_INT_MAX = 2147483647

export const completionSchema = z.object({
  todoId: idSchema,
  date: dateSchema,
  createdAt: createdAtSchema,
})

export const completionPaginationSchema = z.object({
  date: dateSchema,
  offset: z
    .number()
    .int()
    .min(0)
    .max(POSTGRES_INT_MAX)
    .default(0)
    .describe('Indicates the starting point. Default: 0'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Specifies the maximum number of items to retrieve. Default: 20'),
})

export const completionRangeSchema = z.object({
  firstId: idSchema.describe('First id of the range.'),
  secondId: idSchema.describe('Last id of the range.'),
  date: dateSchema,
})

export const completionKeysAll = Object.keys(
  completionSchema.shape
) as (keyof Completion)[]

export const completionKeysPublic = completionKeysAll

export type CompletionPublic = Pick<
  Selectable<Completion>,
  (typeof completionKeysPublic)[number]
>

export type CompletionItem = Omit<Selectable<Completion>, 'createdAt'>

export type CompletionPagination = z.infer<typeof completionPaginationSchema>
