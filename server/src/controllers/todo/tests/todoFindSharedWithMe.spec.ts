import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {findSharedWithMe} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(findSharedWithMe()).rejects.toThrow(/unauthenticated/i)
})

test('find shared todos', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())

  // Create todos for the owner
  const [todo1, todo2] = await insertAll(db, 'todo', [
    fakeTodo({userId: owner.id, title: 'Shared Todo 1'}),
    fakeTodo({userId: owner.id, title: 'Shared Todo 2'})
  ])

  // Share todos with the shared user
  await insertAll(db, 'sharedTodo', [
    {todoId: todo1.id, userId: sharedUser.id},
    {todoId: todo2.id, userId: sharedUser.id}
  ])

  const {findSharedWithMe} = createCaller(authContext({db}, sharedUser))

  // ACT
  const sharedTodos = await findSharedWithMe()

  // ASSERT
  expect(sharedTodos).toHaveLength(2)
  expect(sharedTodos).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: todo1.id,
        title: 'Shared Todo 1',
        userId: owner.id
      }),
      expect.objectContaining({
        id: todo2.id,
        title: 'Shared Todo 2',
        userId: owner.id
      })
    ])
  )
})

test('returns empty array when no shared todos', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const {findSharedWithMe} = createCaller(authContext({db}, user))

  // ACT
  const sharedTodos = await findSharedWithMe()

  // ASSERT
  expect(sharedTodos).toEqual([])
})
