import {requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('find existing user', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const {findById} = createCaller(requestContext({db}))

  // ACT
  const result = await findById({id: user.id})

  // ASSERT
  expect(result).toMatchObject({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  })
  // Should not expose password
  expect(result).not.toHaveProperty('password')
})

test('throws for non-existent user', async () => {
  // ARRANGE
  const {findById} = createCaller(requestContext({db}))
  const nonExistentId = 99999

  // ACT & ASSERT
  await expect(findById({id: nonExistentId})).rejects.toThrow()
})
