import type { Database, UserRelationship } from '@server/database'
import {
  type UserRelationshipPublic,
  userRelationshipKeysPublic,
} from '@server/entities/userRelationship'
import { type Insertable, type Selectable } from 'kysely'

type Pagination = { offset: number; limit: number }

export function userRelationshipRepository(db: Database) {
  return {
    async findAll({
      offset,
      limit,
    }: Pagination): Promise<UserRelationshipPublic[]> {
      return db
        .selectFrom('userRelationship')
        .select(userRelationshipKeysPublic)
        .offset(offset)
        .limit(limit)
        .execute()
    },

    /** Create two entries for a relationship */
    async create(
      userRelationships: Insertable<UserRelationship>
    ): Promise<UserRelationshipPublic> {
      return db
        .insertInto('userRelationship')
        .values([
          userRelationships,
          {
            useraId: userRelationships.userbId,
            userbId: userRelationships.useraId,
          },
        ])
        .returning(userRelationshipKeysPublic)
        .executeTakeFirstOrThrow()
    },

    /** Delete two entries */
    async delete(
      userRelationship: Selectable<Omit<UserRelationship, 'createdAt'>>
    ) {
      db.deleteFrom('userRelationship')
        .where('useraId', '=', userRelationship.useraId)
        .where('useraId', '=', userRelationship.userbId)
        .returning(['useraId', 'userbId'])
        .execute()
    },
    /** Get the type of the relationship */
    async getType(
      userRelationship: Selectable<
        Pick<UserRelationship, 'useraId' | 'userbId'>
      >
    ) {
      return db
        .selectFrom('userRelationship')
        .where('useraId', '=', userRelationship.useraId)
        .where('userbId', '=', userRelationship.userbId)
        .select(userRelationshipKeysPublic)
        .execute()
    },
  }
}

export type UserRelationshipRepository = ReturnType<
  typeof userRelationshipRepository
>
