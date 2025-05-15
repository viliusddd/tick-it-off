import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {updateDetails} = createCaller(requestContext({db}))
  const [user] = await insertAll(db, 'user', fakeUser())

  // ACT & ASSERT
  await expect(
    updateDetails({
      id: user.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    })
  ).rejects.toThrow(/unauthenticated/i)
})

test('update user details', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  const {updateDetails} = createCaller(authContext({db}, user))

  const updatedDetails = {
    id: user.id,
    firstName: 'Updated',
    lastName: 'User',
    email: 'updated.user@example.com'
  }

  // ACT
  const result = await updateDetails(updatedDetails)

  // ASSERT
  expect(result).toMatchObject({
    id: user.id,
    firstName: updatedDetails.firstName,
    lastName: updatedDetails.lastName,
    email: updatedDetails.email
  })
})
