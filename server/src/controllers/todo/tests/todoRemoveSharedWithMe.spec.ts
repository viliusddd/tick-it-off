import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser, fakeTodo, fakeAuthUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll, selectAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('unauthenticated', async () => {
  // ARRANGE
  const {removeSharedWithMe} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(removeSharedWithMe({todoId: 1})).rejects.toThrow(/unauthenticated/i)
})

test('removeSharedWithMe removes a todo shared with the current user', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with sharedUser
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser.id})

  // Verify the todo is shared
  const sharedTodosBefore = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosBefore.length).toBe(1)

  const authUser = fakeAuthUser({id: sharedUser.id})
  const {removeSharedWithMe} = createCaller(authContext({db}, authUser))

  // ACT
  await removeSharedWithMe({todoId: todo.id})

  // ASSERT
  const sharedTodosAfter = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosAfter.length).toBe(0)
})

test('removeSharedWithMe does nothing when todo is not shared with user', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [anotherUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with sharedUser but not with anotherUser
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser.id})

  const authUser = fakeAuthUser({id: anotherUser.id})
  const {removeSharedWithMe} = createCaller(authContext({db}, authUser))

  // ACT - Attempt to remove a share that doesn't exist for this user
  await removeSharedWithMe({todoId: todo.id})

  // ASSERT - The share with sharedUser should still exist
  const sharedTodosAfter = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosAfter.length).toBe(1)
})

test('removeSharedWithMe works with non-existent todo', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const nonExistentTodoId = 99999

  const authUser = fakeAuthUser({id: user.id})
  const {removeSharedWithMe} = createCaller(authContext({db}, authUser))

  // ACT & ASSERT - Should not throw an error
  await expect(removeSharedWithMe({todoId: nonExistentTodoId})).resolves.not.toThrow()
})
