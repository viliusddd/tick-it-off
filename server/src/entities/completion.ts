import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Completion } from '@server/database/types'
import { createdAtSchema, idSchema } from './shared'

export const completionSchema = z.object({
  todoId: idSchema,
  date: z.string().date(),
  createdAt: createdAtSchema,
})

export const completionKeysAll = Object.keys(
  completionSchema.shape
) as (keyof Completion)[]

export const completionKeysPublic = completionKeysAll

export type CompletionPublic = Pick<
  Selectable<Completion>,
  (typeof completionKeysPublic)[number]
>
