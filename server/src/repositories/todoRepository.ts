import type {Database, Todo} from '@server/database'
import {type TodoPublic, todoKeysPublic} from '@server/entities/todo'
import {type Insertable, type Selectable, sql} from 'kysely'

type Pagination = {offset: number; limit: number}

export function todoRepository(db: Database) {
  return {
    async findById(id: number, userId: number) {
      return db
        .selectFrom('todo')
        .select(todoKeysPublic)
        .where('id', '=', id)
        .where('userId', '=', userId)
        .executeTakeFirst()
    },

    async findAll({offset, limit}: Pagination): Promise<TodoPublic[]> {
      return db
        .selectFrom('todo')
        .select(todoKeysPublic)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute()
    },

    async findAllForUser({offset, limit}: Pagination, userId: number): Promise<TodoPublic[]> {
      return db
        .selectFrom('todo')
        .select(todoKeysPublic)
        .where('userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute()
    },

    async create(todo: Insertable<Todo>): Promise<TodoPublic> {
      return db.insertInto('todo').values(todo).returning(todoKeysPublic).executeTakeFirstOrThrow()
    },

    async update(todo: Selectable<Omit<Todo, 'createdAt'>>): Promise<TodoPublic> {
      return db
        .updateTable('todo')
        .set({title: todo.title})
        .where('todo.id', '=', todo.id)
        .where('todo.userId', '=', todo.userId)
        .returning(todoKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(todoId: number, userId: number) {
      db.deleteFrom('todo')
        .where('todo.id', '=', todoId)
        .where('todo.userId', '=', userId)
        .executeTakeFirstOrThrow()
    },

    async getTotalTodoCount() {
      const result = await db
        .selectFrom('todo')
        .select(sql<number>`COUNT(*)`.as('count'))
        .executeTakeFirstOrThrow()

      return result.count ?? 0
    }
  }
}

export type TodoRepository = ReturnType<typeof todoRepository>
