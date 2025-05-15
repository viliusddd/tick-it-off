import {authContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('empty todos', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const caller = createCaller(authContext({db}, user))

  // ACT
  const todos = await caller.findAll()

  // ASSERT
  expect(todos).toHaveLength(0)
})

test('user sees only their todos', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create todos for both users
  await insertAll(db, 'todo', [
    fakeTodo({userId: user1.id, title: 'User1 Todo'}),
    fakeTodo({userId: user2.id, title: 'User2 Todo'})
  ])

  const caller = createCaller(authContext({db}, user1))

  // ACT
  const todos = await caller.findAll()

  // ASSERT
  expect(todos).toHaveLength(1)
  expect(todos[0].userId).toBe(user1.id)
  expect(todos[0].title).toBe('User1 Todo')
})

test('sorts by newest first', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  // Create todos with known IDs
  const [older] = await insertAll(db, 'todo', fakeTodo({userId: user.id, title: 'Older'}))
  const [newer] = await insertAll(db, 'todo', fakeTodo({userId: user.id, title: 'Newer'}))

  const caller = createCaller(authContext({db}, user))

  // ACT
  const todos = await caller.findAll()

  // ASSERT
  expect(todos).toHaveLength(2)
  expect(todos[0].id).toBe(newer.id)
  expect(todos[1].id).toBe(older.id)
})

test('pagination', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  // Create 3 todos
  await insertAll(db, 'todo', [
    fakeTodo({userId: user.id}),
    fakeTodo({userId: user.id}),
    fakeTodo({userId: user.id})
  ])

  const caller = createCaller(authContext({db}, user))

  // ACT - get only 2 with pagination
  const todos = await caller.findAll({offset: 0, limit: 2})

  // ASSERT
  expect(todos).toHaveLength(2)
})
