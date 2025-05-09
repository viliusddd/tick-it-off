import type {Database} from '@server/database'
import type {User} from '@server/database/types'
import {
  type UserPublic,
  type UserPassword,
  userKeysAll,
  userKeysPublic
} from '@server/entities/user'
import type {Insertable, Selectable} from 'kysely'

type Pagination = {offset: number; limit: number}

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db.insertInto('user').values(user).returning(userKeysPublic).executeTakeFirstOrThrow()
    },

    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('email', '=', email)
        .executeTakeFirst()

      return user
    },
    async findAll({offset, limit}: Pagination): Promise<UserPublic[]> {
      return db
        .selectFrom('user')
        .select(userKeysPublic)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute()
    },
    async findById(id: number, includePassword = false) {
      return db
        .selectFrom('user')
        .select(includePassword ? userKeysAll : userKeysPublic)
        .where('id', '=', id)
        .executeTakeFirstOrThrow()
    },
    async updateDetails(
      user: Selectable<Omit<User, 'createdAt' | 'password'>>
    ): Promise<UserPublic> {
      return db
        .updateTable('user')
        .set({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        })
        .where('user.id', '=', user.id)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async updatePassword(user: Selectable<UserPassword>): Promise<UserPublic> {
      return db
        .updateTable('user')
        .set({
          password: user.password
        })
        .where('user.id', '=', user.id)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async delete(id: number) {
      db.deleteFrom('user').where('user.id', '=', id).execute()
    }
  }
}

export type UserRepository = ReturnType<typeof userRepository>
