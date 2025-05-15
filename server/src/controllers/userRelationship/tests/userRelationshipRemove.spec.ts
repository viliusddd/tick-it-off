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
  const {remove} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(remove({useraId: 1, userbId: 2})).rejects.toThrow(/unauthenticated/i)
})

test('remove deletes bidirectional relationship', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create relationships
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  // Verify relationships exist
  const relationship1Before = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user1.id).and('userbId', '=', user2.id)
  )

  const relationship2Before = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user2.id).and('userbId', '=', user1.id)
  )

  expect(relationship1Before.length).toBe(1)
  expect(relationship2Before.length).toBe(1)

  const authUser = fakeAuthUser({id: user1.id})
  const {remove} = createCaller(authContext({db}, authUser))

  // ACT
  await remove({
    useraId: user1.id,
    userbId: user2.id
  })

  // ASSERT
  const relationship1After = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user1.id).and('userbId', '=', user2.id)
  )

  const relationship2After = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user2.id).and('userbId', '=', user1.id)
  )

  expect(relationship1After.length).toBe(0)
  expect(relationship2After.length).toBe(0)
})

test('remove with non-existent relationship does not throw error', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // No relationship created

  const authUser = fakeAuthUser({id: user1.id})
  const {remove} = createCaller(authContext({db}, authUser))

  // ACT & ASSERT - Should not throw an error
  await expect(
    remove({
      useraId: user1.id,
      userbId: user2.id
    })
  ).resolves.not.toThrow()
})

test('remove works in either direction', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create relationships
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  const authUser = fakeAuthUser({id: user1.id})
  const {remove} = createCaller(authContext({db}, authUser))

  // ACT - Note the reversed order compared to how they were created
  await remove({
    useraId: user2.id,
    userbId: user1.id
  })

  // ASSERT - Both directions should be removed
  const relationship1After = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user1.id).and('userbId', '=', user2.id)
  )

  const relationship2After = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user2.id).and('userbId', '=', user1.id)
  )

  expect(relationship1After.length).toBe(0)
  expect(relationship2After.length).toBe(0)
})
