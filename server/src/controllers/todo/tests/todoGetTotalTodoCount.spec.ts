import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll, clearTables} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {getTotalTodoCount} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(getTotalTodoCount()).rejects.toThrow(/unauthenticated/i)
})

