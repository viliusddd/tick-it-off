import type {Database} from '@server/database'
import {completionRepository} from './completionRepository'
import {userRelationshipRepository} from './userRelationshipRepository'
import {sharedTodoRepository} from './sharedTodoRepository'
import {todoRepository} from './todoRepository'
import {userRepository} from './userRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = {
  completionRepository,
  userRelationshipRepository,
  sharedTodoRepository,
  todoRepository,
  userRepository
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export {repositories}
