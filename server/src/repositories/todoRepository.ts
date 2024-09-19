import type { Database, Todo } from '@server/database'
import { type TodoPublic, todoKeysPublic } from '@server/entities/todo'
import { type Insertable } from 'kysely'

type Pagination = { offset: number; limit: number }

export function todoRepository(db: Database) {
  return {
    async findById(id: number) {
      return db
        .selectFrom('todo')
        .select(todoKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },

    async findAll({ offset, limit }: Pagination): Promise<TodoPublic[]> {
      return db
        .selectFrom('todo')
        .select(todoKeysPublic)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute()
    },

    async create(todo: Insertable<Todo>): Promise<TodoPublic> {
      return db
        .insertInto('todo')
        .values(todo)
        .returning(todoKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async toggle(id: number): Promise<TodoPublic> {
      const { completed } = (await this.findById(id)) || {}

      return db
        .updateTable('todo')
        .set({ completed: !completed })
        .where('id', '=', id)
        .returning(todoKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(id: number) {
      db.deleteFrom('todo').where('todo.id', '=', id).execute()
    },
  }
}

export type TodoRepository = ReturnType<typeof todoRepository>
