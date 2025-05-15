import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll} from '@tests/utils/records'
import {fakeUser, fakeAuthUser} from '@server/entities/tests/fakes'
import {authContext, requestContext} from '@tests/utils/context'
import userRelationshipRouter from '..'

const createCaller = createCallerFactory(userRelationshipRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {getStatus} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(getStatus({useraId: 1, userbId: 2})).rejects.toThrow(/unauthenticated/i)
})

test('getStatus returns relationship status when it exists', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create relationship
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  const authUser = fakeAuthUser({id: user1.id})
  const {getStatus} = createCaller(authContext({db}, authUser))

  // ACT
  const result = await getStatus({
    useraId: user1.id,
    userbId: user2.id
  })

  // ASSERT
  expect(result).toHaveLength(1)
  expect(result[0].useraId).toBe(user1.id)
  expect(result[0].userbId).toBe(user2.id)
  expect(result[0].createdAt).toBeDefined()
})

test('getStatus returns empty array when relationship does not exist', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // No relationship created

  const authUser = fakeAuthUser({id: user1.id})
  const {getStatus} = createCaller(authContext({db}, authUser))

  // ACT
  const result = await getStatus({
    useraId: user1.id,
    userbId: user2.id
  })

  // ASSERT
  expect(result).toHaveLength(0)
})

test('getStatus can check other users relationships', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())
  const [user3] = await insertAll(db, 'user', fakeUser())

  // Create relationship between user1 and user2
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  // Auth as user3
  const authUser = fakeAuthUser({id: user3.id})
  const {getStatus} = createCaller(authContext({db}, authUser))

  // ACT
  const result = await getStatus({
    useraId: user1.id,
    userbId: user2.id
  })

  // ASSERT
  expect(result).toHaveLength(1)
  expect(result[0].useraId).toBe(user1.id)
  expect(result[0].userbId).toBe(user2.id)
})
