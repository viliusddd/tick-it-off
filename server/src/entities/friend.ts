import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Friend } from '@server/database/types'
import { createdAtSchema, idSchema } from './shared'

export const friendSchema = z.object({
  useraId: idSchema,
  userbId: idSchema,
  createdAt: createdAtSchema,
})

export const friendIdsSchema = friendSchema.omit({ createdAt: true })

export const friendKeysAll = Object.keys(friendSchema.shape) as (keyof Friend)[]

export const friendKeysPublic = friendKeysAll

export type FriendPublic = Pick<
  Selectable<Friend>,
  (typeof friendKeysPublic)[number]
>
