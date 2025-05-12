import type {Database, SharedTodo} from '@server/database'
import {type SharedTodoPublic, sharedTodoKeysPublic} from '@server/entities/sharedTodo'
import type {TodoPublic} from '@server/entities/todo'
import {type Insertable, type Selectable} from 'kysely'

type Pagination = {offset: number; limit: number}

export function sharedTodoRepository(db: Database) {
  return {
    async findAll({offset, limit}: Pagination): Promise<SharedTodoPublic[]> {
      return db
        .selectFrom('sharedTodo')
        .innerJoin('todo', 'todo.id', 'sharedTodo.todoId')
        .innerJoin('user', 'user.id', 'sharedTodo.userId')
        .select(sharedTodoKeysPublic)
        .orderBy('sharedTodo.todoId', 'desc')
        .offset(offset)
        .limit(limit)
        .execute()
    },

    async findTodos(userId: number): Promise<TodoPublic[]> {
      return db
        .selectFrom('sharedTodo')
        .innerJoin('todo', 'todo.id', 'sharedTodo.todoId')
        .innerJoin('user', 'user.id', 'sharedTodo.userId')
        .where('sharedTodo.userId', '=', userId)
        .select(['todo.id', 'todo.title', 'todo.createdAt', 'todo.userId'])
        .execute()
    },

    async findUsers(todoId: number): Promise<{userId: number}[]> {
      return db.selectFrom('sharedTodo').where('todoId', '=', todoId).select('userId').execute()
    },

    async create(sharedTodo: Insertable<SharedTodo>): Promise<SharedTodoPublic> {
      return db
        .insertInto('sharedTodo')
        .values(sharedTodo)
        .returning(sharedTodoKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async delete(sharedTodo: Selectable<Omit<SharedTodo, 'createdAt'>>) {
      db.deleteFrom('sharedTodo')
        .where('todoId', '=', sharedTodo.todoId)
        .where('userId', '=', sharedTodo.userId)
        .returning(['todoId', 'userId'])
        .execute()
    }
  }
}

export type SharedTodoRepository = ReturnType<typeof sharedTodoRepository>
