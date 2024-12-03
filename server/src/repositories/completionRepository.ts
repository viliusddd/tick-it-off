import type {Database, Completion} from '@server/database'
import {
  type CompletionItem,
  type CompletionPagination,
  type CompletionPublic,
  completionKeysPublic
} from '@server/entities/completion'
import type {Insertable} from 'kysely'

export function completionRepository(db: Database) {
  return {
    async findByRange(firstId: number, secondId: number, date: string) {
      return db
        .selectFrom('completion')
        .select(completionKeysPublic)
        .where('completion.date', '=', date)
        .where('completion.todoId', '>=', firstId)
        .where('completion.todoId', '<=', secondId)
        .execute()
    },

    async findById(completion: CompletionItem) {
      return db
        .selectFrom('completion')
        .select(completionKeysPublic)
        .where('completion.todoId', '=', completion.todoId)
        .where('completion.date', '=', completion.date)
        .executeTakeFirst()
    },

    async findAll(completion: CompletionPagination): Promise<CompletionPublic[]> {
      return db
        .selectFrom('completion')
        .innerJoin('todo', 'todo.id', 'completion.todoId')
        .where('completion.date', '=', completion.date)
        .select(completionKeysPublic)
        .orderBy('completion.todoId', 'desc')
        .offset(completion.offset)
        .limit(completion.limit)
        .execute()
    },

    async create(completion: Insertable<Completion>): Promise<CompletionPublic> {
      return db
        .insertInto('completion')
        .values(completion)
        .returning(completionKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(completion: CompletionItem) {
      db.deleteFrom('completion')
        .where('completion.todoId', '=', completion.todoId)
        .where('completion.date', '=', completion.date)
        .executeTakeFirstOrThrow()
    },

    /** Create a new entry if it doesn't exist; otherwise, delete the existing one. */
    async toggle(completion: CompletionItem) {
      const foundItems = await this.findById(completion)
      if (!foundItems) return this.create(completion)
      return this.delete(completion)
    }
  }
}

export type CompletionRepository = ReturnType<typeof completionRepository>
