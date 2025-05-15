import {requestContext} from '@tests/utils/context'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {fakeUser} from '@server/entities/tests/fakes'
import {selectAll, insertAll} from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('delete user', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const {deleteById} = createCaller(requestContext({db}))

  // Verify user exists
  const usersBefore = await selectAll(db, 'user', eb => eb('id', '=', user.id))
  expect(usersBefore.length).toBe(1)

  // ACT
  await deleteById({id: user.id})

  // ASSERT
  const usersAfter = await selectAll(db, 'user', eb => eb('id', '=', user.id))
  expect(usersAfter.length).toBe(0)
})

test('no error when deleting non-existent user', async () => {
  // ARRANGE
  const {deleteById} = createCaller(requestContext({db}))
  const nonExistentId = 99999

  // ACT & ASSERT
  // Should not throw an error
  await expect(deleteById({id: nonExistentId})).resolves.not.toThrow()
})
