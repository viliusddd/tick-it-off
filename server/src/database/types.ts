import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Completion {
  createdAt: Generated<Timestamp>
  date: Timestamp
  todoId: number
}

export interface Todo {
  createdAt: Generated<Timestamp>
  id: Generated<number>
  title: string
}

export interface User {
  createdAt: Generated<Timestamp>
  email: string
  githubId: string
  id: Generated<number>
  image: string
}

export interface DB {
  completion: Completion
  todo: Todo
  user: User
}
