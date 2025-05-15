import {requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import userRouter from '..'

const createCaller = createCallerFactory(userRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('find all users with defaults', async () => {
  // ARRANGE
  const users = await insertAll(db, 'user', [
    fakeUser({firstName: 'User1'}),
    fakeUser({firstName: 'User2'}),
    fakeUser({firstName: 'User3'})
  ])
  const {findAll} = createCaller(requestContext({db}))

  // ACT
  const result = await findAll()

  // ASSERT
  expect(result.length).toBeGreaterThanOrEqual(3)

  // Verify our inserted users are included in the results
  const userIds = users.map(u => u.id)
  const resultUserIds = result.map(u => u.id)
  expect(resultUserIds).toEqual(expect.arrayContaining(userIds))

  // Check no passwords are returned
  result.forEach(user => {
    expect(user).not.toHaveProperty('password')
  })
})

test('find users with pagination', async () => {
  // ARRANGE
  await insertAll(db, 'user', [
    fakeUser({firstName: 'PaginatedUser1'}),
    fakeUser({firstName: 'PaginatedUser2'}),
    fakeUser({firstName: 'PaginatedUser3'}),
    fakeUser({firstName: 'PaginatedUser4'}),
    fakeUser({firstName: 'PaginatedUser5'})
  ])
  const {findAll} = createCaller(requestContext({db}))

  // ACT
  const result = await findAll({offset: 0, limit: 2})

  // ASSERT
  expect(result.length).toBe(2)
})
