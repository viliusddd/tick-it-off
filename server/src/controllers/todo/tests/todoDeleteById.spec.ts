import { authContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should remove a todo', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const { deleteById } = createCaller(authContext({ db }, user))

  // ACT
  const todoReturned = await deleteById({ id: 1 })

  // ASSERT
  expect(todoReturned).toMatchObject({})
})

it('should return undefined if todo is not found', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const { deleteById } = createCaller(authContext({ db }, user))

  // ACT
  const todoReturned = await deleteById({ id: 99999 })

  // ASSERT
  expect(todoReturned).toBeUndefined()
})
