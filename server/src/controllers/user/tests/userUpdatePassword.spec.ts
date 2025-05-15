import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import bcrypt from 'bcrypt'
import config from '@server/config'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {updatePassword} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(
    updatePassword({
      oldPassword: 'Password.123!',
      newPassword: 'NewPassword.123!'
    })
  ).rejects.toThrow(/unauthenticated/i)
})

test('update password successfully', async () => {
  // ARRANGE
  const password = 'Password.123!'
  const hashedPassword = await bcrypt.hash(password, config.auth.passwordCost)
  const [user] = await insertAll(db, 'user', fakeUser({password: hashedPassword}))

  const {updatePassword} = createCaller(authContext({db}, user))

  // ACT
  const result = await updatePassword({
    oldPassword: password,
    newPassword: 'NewPassword.123!'
  })

  // ASSERT
  expect(result).toMatchObject({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  })
})

test('rejects incorrect old password', async () => {
  // ARRANGE
  const password = 'Password.123!'
  const hashedPassword = await bcrypt.hash(password, config.auth.passwordCost)
  const [user] = await insertAll(db, 'user', fakeUser({password: hashedPassword}))

  const {updatePassword} = createCaller(authContext({db}, user))

  // ACT & ASSERT
  await expect(
    updatePassword({
      oldPassword: 'WrongPassword.123!',
      newPassword: 'NewPassword.123!'
    })
  ).rejects.toThrow(/old password is incorrect/i)
})
