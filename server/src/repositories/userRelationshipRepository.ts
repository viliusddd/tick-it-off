import type { Database, UserRelationship } from '@server/database'
import {
  type UserRelationshipPublic,
  userRelationshipKeysPublic,
} from '@server/entities/userRelationship'
import { sql, type Insertable, type Selectable } from 'kysely'

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

    async findAllWithUsers({ offset, limit }: Pagination) {
      return db
        .selectFrom('userRelationship as ur')
        .rightJoin('user as usera', 'ur.useraId', 'usera.id')
        .rightJoin('user as userb', 'ur.userbId', 'userb.id')
        .select([
          'usera.id as useraId',
          'usera.firstName as useraFirstName',
          'usera.lastName as useraLastName',
          'userb.id as userbId',
          'userb.firstName as userbFirstName',
          'userb.lastName as userbLastName',
        ])
        .offset(offset)
        .limit(limit)
        .execute()
    },

    /** Create two entries for a relationship */
    async add(
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

    /** Delete both entries */
    async remove({
      useraId,
      userbId,
    }: Selectable<Omit<UserRelationship, 'createdAt'>>) {
      // db.deleteFrom('userRelationship')
      //   .where('useraId', '=', useraId)
      //   .where('userbId', '=', userbId)
      // db.deleteFrom('userRelationship')
      //   .where('userbId', '=', userbId)
      //   .where('useraId', '=', useraId)
      //   .execute()

      // await db.transaction().execute(async (trx) => {
      //   await trx
      //     .deleteFrom('userRelationship')
      //     .where('useraId', '=', useraId)
      //     .where('userbId', '=', userbId)
      //     // .returning(['useraId', 'userbId'])
      //     .execute()

      //   await trx
      //     .deleteFrom('userRelationship')
      //     .where('userbId', '=', userbId)
      //     .where('useraId', '=', useraId)
      //     .execute()
      // })

      await db
        .transaction()
        .execute(async (trx) =>
          sql`DELETE FROM "user_relationship" WHERE ( "usera_id" = ${useraId} AND "userb_id" = ${userbId}) OR ( "usera_id" = ${userbId} AND "userb_id" = ${useraId})`.execute(
            trx
          )
        )
    },

    /** Get the type of the relationship */
    async getStatus({
      useraId,
      userbId,
    }: Selectable<Pick<UserRelationship, 'useraId' | 'userbId'>>) {
      return db
        .selectFrom('userRelationship')
        .where('useraId', '=', useraId)
        .where('userbId', '=', userbId)
        .select(userRelationshipKeysPublic)
        .execute()
    },
  }
}

export type UserRelationshipRepository = ReturnType<
  typeof userRelationshipRepository
>
