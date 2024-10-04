import type { Database, Completion } from '@server/database'
import {
  type CompletionPublic,
  completionKeysPublic,
} from '@server/entities/completion'
import type { Insertable } from 'kysely'

type Pagination = {
  offset: number
  limit: number
}

export function completionRepository(db: Database) {
  return {
    async findByRange(firstId: number, secondId: number, date: Date) {
      return db
        .selectFrom('completion')
        .select(completionKeysPublic)
        .where('completion.date', '=', date)
        .where('completion.todoId', '>=', firstId)
        .where('completion.todoId', '<=', secondId)
        .execute()
    },

    async findById(todoId: number, date: Date) {
      return db
        .selectFrom('completion')
        .select(completionKeysPublic)
        .where('completion.todoId', '=', todoId)
        .where('completion.date', '=', date)
        .executeTakeFirst()
    },

    async findAll(
      date: Date,
      pagination: Pagination
    ): Promise<CompletionPublic[]> {
      return db
        .selectFrom('completion')
        .innerJoin('todo', 'todo.id', 'completion.todoId')
        .where('completion.date', '=', date)
        .select(completionKeysPublic)
        .orderBy('completion.todoId', 'desc')
        .offset(pagination.offset)
        .limit(pagination.limit)
        .execute()
    },

    async create(
      completion: Insertable<Completion>
    ): Promise<CompletionPublic> {
      return db
        .insertInto('completion')
        .values(completion)
        .returning(completionKeysPublic)
        .executeTakeFirstOrThrow()
    },

    /** Create a new entry if it doesn't exist; otherwise, delete the existing one. */
    async toggle(todoId: number, date: Date) {
      const foo = await this.findById(todoId, date)
      if (!foo) return this.create({ todoId, date })
      return this.delete(todoId, date)
    },

    async delete(todoId: number, date: Date) {
      db.deleteFrom('completion')
        .where('completion.todoId', '=', todoId)
        .where('completion.date', '=', date)
        .executeTakeFirstOrThrow()
    },
  }
}

export type CompletionRepository = ReturnType<typeof completionRepository>
