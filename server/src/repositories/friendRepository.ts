import type { Database, Friend } from '@server/database'
import { type FriendPublic, friendKeysPublic } from '@server/entities/friend'
import { type Insertable, type Selectable } from 'kysely'

type Pagination = { offset: number; limit: number }

export function friendRepository(db: Database) {
  return {
    async findAll({ offset, limit }: Pagination): Promise<FriendPublic[]> {
      return db
        .selectFrom('friend')
        .select(friendKeysPublic)
        .offset(offset)
        .limit(limit)
        .execute()
    },

    /** Create two entries for a relationship */
    async create(friends: Insertable<Friend>): Promise<FriendPublic> {
      return db
        .insertInto('friend')
        .values([
          friends,
          { useraId: friends.userbId, userbId: friends.useraId },
        ])
        .returning(friendKeysPublic)
        .executeTakeFirstOrThrow()
    },

    /** Delete two entries */
    async delete(friend: Selectable<Omit<Friend, 'createdAt'>>) {
      db.deleteFrom('friend')
        .where('useraId', '=', friend.useraId)
        .where('useraId', '=', friend.userbId)
        .returning(['useraId', 'userbId'])
        .execute()
    },
  }
}

export type FriendRepository = ReturnType<typeof friendRepository>
