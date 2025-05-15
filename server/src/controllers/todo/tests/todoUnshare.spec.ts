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
  const {unshare} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(unshare({todoId: 1, userId: 1})).rejects.toThrow(/unauthenticated/i)
})

test('unshare removes todo share for specified user', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with the user
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser.id})

  // Verify the todo is shared
  const sharedTodosBefore = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosBefore.length).toBe(1)

  const authUser = fakeAuthUser({id: owner.id})
  const {unshare} = createCaller(authContext({db}, authUser))

  // ACT
  await unshare({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // ASSERT - verify the todo is no longer shared
  const sharedTodosAfter = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosAfter.length).toBe(0)
})

test('unshare works for non-existent share', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [anotherUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // No share created

  const authUser = fakeAuthUser({id: owner.id})
  const {unshare} = createCaller(authContext({db}, authUser))

  // ACT & ASSERT - Should not throw an error
  await expect(
    unshare({
      todoId: todo.id,
      userId: anotherUser.id
    })
  ).resolves.not.toThrow()
})

test('unshare works when another user has access to the todo', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser1] = await insertAll(db, 'user', fakeUser())
  const [sharedUser2] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with two users
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser1.id})
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser2.id})

  const authUser = fakeAuthUser({id: owner.id})
  const {unshare} = createCaller(authContext({db}, authUser))

  // ACT - Unshare with just one user
  await unshare({
    todoId: todo.id,
    userId: sharedUser1.id
  })

  // ASSERT - Only sharedUser1's access should be removed
  const sharedTodos1After = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser1.id)
  )
  expect(sharedTodos1After.length).toBe(0)

  const sharedTodos2After = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser2.id)
  )
  expect(sharedTodos2After.length).toBe(1)
})
