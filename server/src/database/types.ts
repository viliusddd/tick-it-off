import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Todo {
  createdAt: Generated<Timestamp>
  date: Timestamp | null
  id: Generated<number>
  isCompleted: Generated<boolean | null>
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
  todo: Todo
  user: User
}
