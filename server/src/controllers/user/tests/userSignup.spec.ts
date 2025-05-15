import {createTestDatabase} from '@tests/utils/database'
import {fakeUser} from '@server/entities/tests/fakes'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {selectAll} from '@tests/utils/records'
import {random} from '@tests/utils/random'
import {requestContext} from '@tests/utils/context'
import bcrypt from 'bcrypt'
import userRouter from '..'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(userRouter)
const {signup} = createCaller(requestContext({db}))

test('signup creates a new user', async () => {
  // ARRANGE
  const userData = fakeUser()

  // ACT
  const result = await signup({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName
  })

  // ASSERT
  expect(result.id).toBeDefined()

  // Verify user was created in the database
  const createdUser = await selectAll(db, 'user', eb => eb('id', '=', result.id))
  expect(createdUser.length).toBe(1)
  expect(createdUser[0].email).toBe(userData.email)
  expect(createdUser[0].firstName).toBe(userData.firstName)
  expect(createdUser[0].lastName).toBe(userData.lastName)

  // Password should be hashed
  expect(createdUser[0].password).not.toBe(userData.password)
  const isPasswordValid = await bcrypt.compare(userData.password, createdUser[0].password)
  expect(isPasswordValid).toBe(true)
})

test('signup with existing email throws error', async () => {
  // ARRANGE
  const userData = fakeUser()
  await signup({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName
  })

  // ACT & ASSERT - Attempt to create another user with the same email
  await expect(
    signup({
      email: userData.email,
      password: 'DifferentPassword.123!',
      firstName: 'Different',
      lastName: 'User'
    })
  ).rejects.toThrow(/User with this email already exists/)
})

test('signup with invalid data throws error', async () => {
  // ARRANGE
  // ACT & ASSERT - Missing required fields
  await expect(
    signup({
      email: '',
      password: 'Password.123!',
      firstName: 'Test',
      lastName: 'User'
    })
  ).rejects.toThrow()

  // ACT & ASSERT - Invalid email format
  await expect(
    signup({
      email: 'invalid-email',
      password: 'Password.123!',
      firstName: 'Test',
      lastName: 'User'
    })
  ).rejects.toThrow()
})

it('should require a valid email', async () => {
  await expect(
    signup(
      fakeUser({
        email: 'user-email-invalid'
      })
    )
  ).rejects.toThrow(/email/i) // throws out some error complaining about "email"
})

it('should require a password with at least 8 characters', async () => {
  await expect(
    signup(
      fakeUser({
        password: 'pas.123'
      })
    )
  ).rejects.toThrow(/password/i) // throws out some error complaining about "password"
})

it('throws an error for invalid email', async () => {
  await expect(
    signup(
      fakeUser({
        email: 'not-an-email'
      })
    )
  ).rejects.toThrow(/email/)
})

it('stores lowercased email', async () => {
  const user = fakeUser()

  await signup({
    ...user,
    email: user.email.toUpperCase()
  })

  // get user with original lowercase email
  const userSaved = await selectAll(db, 'user', eb => eb('email', '=', user.email))

  expect(userSaved).toHaveLength(1)
})

it('stores email with trimmed whitespace', async () => {
  const user = fakeUser()
  await signup({
    ...user,
    email: ` \t ${user.email}\t ` // tabs and spaces
  })

  const userSaved = await selectAll(db, 'user', eb => eb('email', '=', user.email))

  expect(userSaved).toHaveLength(1)
})

it('throws an error for duplicate email', async () => {
  const email = random.email()

  // signup once
  await signup(fakeUser({email}))

  // expect that the second signup will throw an error
  await expect(signup(fakeUser({email}))).rejects.toThrow(/email already exists/i)
})
