import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Completion {
  createdAt: Generated<Timestamp>
  date: string
  todoId: number
}

export interface SharedTodo {
  createdAt: Generated<Timestamp>
  todoId: number
  userId: number
}

export interface Todo {
  createdAt: Generated<Timestamp>
  id: Generated<number>
  title: string
  userId: number
}

export interface User {
  createdAt: Generated<Timestamp>
  email: string
  firstName: string
  id: Generated<number>
  lastName: string
  password: string
}

export interface DB {
  completion: Completion
  sharedTodo: SharedTodo
  todo: Todo
  user: User
}
