import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeUser} from '@server/entities/tests/fakes'
import {userRelationshipRepository} from '../userRelationshipRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repo = userRelationshipRepository(db)


test('findAllWithUsers returns paginated relationships with user details', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create relationship
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  // ACT
  const result = await repo.findAllWithUsers({offset: 0, limit: 5})

  // ASSERT
  expect(result.length).toBeGreaterThanOrEqual(1)

  // Find relationships that include our test users
  const testRelationships = result.filter(
    r =>
      (r.useraId === user1.id && r.userbId === user2.id) ||
      (r.useraId === user2.id && r.userbId === user1.id)
  )

  // Verify relationships contain user details
  testRelationships.forEach(relationship => {
    expect(relationship.useraId).toBeDefined()
    expect(relationship.useraFirstName).toBeDefined()
    expect(relationship.useraLastName).toBeDefined()
    expect(relationship.userbId).toBeDefined()
    expect(relationship.userbFirstName).toBeDefined()
    expect(relationship.userbLastName).toBeDefined()
  })
})

test('add creates two relationship records (bidirectional)', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  const relationshipData = {
    useraId: user1.id,
    userbId: user2.id
  }

  // ACT
  const result = await repo.add(relationshipData)

  // ASSERT
  expect(result.useraId).toBe(user1.id)
  expect(result.userbId).toBe(user2.id)
  expect(result.createdAt).toBeDefined()

  // Verify both directions were saved to the database
  const relationships1 = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user1.id).and('userbId', '=', user2.id)
  )

  const relationships2 = await selectAll(db, 'userRelationship', eb =>
    eb('useraId', '=', user2.id).and('userbId', '=', user1.id)
  )

  expect(relationships1.length).toBe(1)
  expect(relationships2.length).toBe(1)

  // Check that bidirectional relationship was created
  expect(relationships1[0].useraId).toBe(user1.id)
  expect(relationships1[0].userbId).toBe(user2.id)
  expect(relationships2[0].useraId).toBe(user2.id)
  expect(relationships2[0].userbId).toBe(user1.id)
})

test('remove deletes both relationship entries', async () => {
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

  // ACT
  await repo.remove({useraId: user1.id, userbId: user2.id})

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

test('getStatus returns relationship status between users', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())
  const [user3] = await insertAll(db, 'user', fakeUser())

  // Create relationship between user1 and user2
  await insertAll(db, 'userRelationship', {useraId: user1.id, userbId: user2.id})
  await insertAll(db, 'userRelationship', {useraId: user2.id, userbId: user1.id})

  // ACT - Check existing relationship
  const existingResult = await repo.getStatus({useraId: user1.id, userbId: user2.id})

  // ACT - Check non-existing relationship
  const nonExistingResult = await repo.getStatus({useraId: user1.id, userbId: user3.id})

  // ASSERT
  // For existing relationship
  expect(existingResult.length).toBe(1)
  expect(existingResult[0].useraId).toBe(user1.id)
  expect(existingResult[0].userbId).toBe(user2.id)

  // For non-existing relationship
  expect(nonExistingResult.length).toBe(0)
})
