import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
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

test('remove shared todo', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo with the user
  await insertAll(db, 'sharedTodo', {
    todoId: todo.id,
    userId: sharedUser.id
  })

  // Verify the todo is shared
  const sharedTodosBefore = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosBefore.length).toBe(1)

  const {removeSharedWithMe} = createCaller(authContext({db}, sharedUser))

  // ACT - the shared user removes the shared todo
  await removeSharedWithMe({todoId: todo.id})

  // ASSERT - verify the todo is no longer shared
  const sharedTodosAfter = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(sharedTodosAfter.length).toBe(0)
})

test('no error when removing non-existent share', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))
  const {removeSharedWithMe} = createCaller(authContext({db}, user))

  // ACT & ASSERT - Should not throw an error
  await expect(removeSharedWithMe({todoId: todo.id})).resolves.not.toThrow()
})
