import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll, clearTables} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

// Clear todos first to ensure a clean state
await clearTables(db, ['todo'])

test('unauthenticated', async () => {
  // ARRANGE
  const {getTotalTodoCount} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(getTotalTodoCount()).rejects.toThrow(/unauthenticated/i)
})

test('count todos', async () => {
  // ARRANGE

  const [user] = await insertAll(db, 'user', fakeUser())
  await insertAll(db, 'todo', [
    fakeTodo({userId: user.id}),
    fakeTodo({userId: user.id}),
    fakeTodo({userId: user.id})
  ])
  const {getTotalTodoCount} = createCaller(authContext({db}, user))

  // ACT
  const count = await getTotalTodoCount()

  // ASSERT
  expect(typeof count).toBe('string')
  expect(Number(count)).toBeGreaterThanOrEqual(3)
})
