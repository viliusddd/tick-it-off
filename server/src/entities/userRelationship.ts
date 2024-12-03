import {z} from 'zod'
import type {Selectable} from 'kysely'
import type {UserRelationship} from '@server/database/types'
import {createdAtSchema, idSchema} from './shared'

export const userRelationshipSchema = z.object({
  useraId: idSchema,
  userbId: idSchema,
  createdAt: createdAtSchema
})

export const userRelationshipIdsSchema = userRelationshipSchema.omit({
  createdAt: true
})

export const userRelationshipKeysAll = Object.keys(
  userRelationshipSchema.shape
) as (keyof UserRelationship)[]

export const userRelationshipKeysPublic = userRelationshipKeysAll

export type UserRelationshipPublic = Pick<
  Selectable<UserRelationship>,
  (typeof userRelationshipKeysPublic)[number]
>
