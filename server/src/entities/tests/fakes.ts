import type {Todo, User} from '@server/database/types'
import type {Insertable} from 'kysely'
import {random} from '@tests/utils/random'
import type {AuthUser} from '../user'

const randomId = () =>
  random.integer({
    min: 1,
    max: 1000000
  })

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<User>>>(overrides: T = {} as T) =>
  ({
    email: random.email(),
    firstName: random.first(),
    lastName: random.last(),
    password: 'Password.123!',
    ...overrides
  }) satisfies Insertable<User>

export const fakeAuthUser = <T extends Partial<AuthUser>>(overrides: T = {} as T): AuthUser => ({
  id: randomId(),
  email: random.email(),
  ...overrides
})

/**
 * Generates a fake todo with some default test data.
 * @param overrides userId and any properties that should be different from default fake data.
 */
export const fakeTodo = <T extends Partial<Insertable<Todo>>>(overrides: T) =>
  ({
    title: random.string(),
    userId: randomId(),
    ...overrides
  }) satisfies Insertable<Todo>
