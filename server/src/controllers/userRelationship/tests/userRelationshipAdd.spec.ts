import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeUser, fakeAuthUser} from '@server/entities/tests/fakes'
import {authContext, requestContext} from '@tests/utils/context'
import userRelationshipRouter from '..'

const createCaller = createCallerFactory(userRelationshipRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {add} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(add({useraId: 1, userbId: 2})).rejects.toThrow(/unauthenticated/i)
})

test('add creates bidirectional relationship', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  const authUser = fakeAuthUser({id: user1.id})
  const {add} = createCaller(authContext({db}, authUser))

  // ACT
  const result = await add({
    useraId: user1.id,
    userbId: user2.id
  })

  // ASSERT
  expect(result.useraId).toBe(user1.id)
  expect(result.userbId).toBe(user2.id)
  expect(result.createdAt).toBeDefined()

  // Verify both directions were created in the database
  const relationships1 = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user1.id).and('userbId', '=', user2.id)
  )

  const relationships2 = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user2.id).and('userbId', '=', user1.id)
  )

  expect(relationships1.length).toBe(1)
  expect(relationships2.length).toBe(1)
})

test('add with non-existent user throws error', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const nonExistentUserId = 99999

  const authUser = fakeAuthUser({id: user.id})
  const {add} = createCaller(authContext({db}, authUser))

  // ACT & ASSERT
  await expect(
    add({
      useraId: user.id,
      userbId: nonExistentUserId
    })
  ).rejects.toThrow()
})

test('add with same user IDs throws error', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  const authUser = fakeAuthUser({id: user.id})
  const {add} = createCaller(authContext({db}, authUser))

  // ACT & ASSERT
  await expect(
    add({
      useraId: user.id,
      userbId: user.id
    })
  ).rejects.toThrow()
})
