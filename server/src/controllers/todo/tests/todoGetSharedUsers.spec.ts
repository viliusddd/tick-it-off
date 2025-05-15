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
  const {getSharedUsers} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(getSharedUsers({todoId: 1})).rejects.toThrow(/unauthenticated/i)
})

test('shared users list', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser1, sharedUser2] = await insertAll(db, 'user', [fakeUser(), fakeUser()])

  // Create a todo for the owner
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with two users
  await insertAll(db, 'sharedTodo', [
    {todoId: todo.id, userId: sharedUser1.id},
    {todoId: todo.id, userId: sharedUser2.id}
  ])

  const {getSharedUsers} = createCaller(authContext({db}, owner))

  // ACT
  const sharedUsers = await getSharedUsers({todoId: todo.id})

  // ASSERT
  expect(sharedUsers).toHaveLength(2)
  expect(sharedUsers).toEqual([{userId: sharedUser1.id}, {userId: sharedUser2.id}])
})

test('returns empty array when todo not shared', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))
  const {getSharedUsers} = createCaller(authContext({db}, owner))

  // ACT
  const sharedUsers = await getSharedUsers({todoId: todo.id})

  // ASSERT
  expect(sharedUsers).toEqual([])
})
