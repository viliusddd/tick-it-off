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
  const {share} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(share({todoId: 1, userId: 1})).rejects.toThrow(/unauthenticated/i)
})

test('success', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))
  const {share} = createCaller(authContext({db}, owner))

  // ACT
  const sharedTodo = await share({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // ASSERT
  expect(sharedTodo).toMatchObject({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // Verify it was persisted
  const [savedSharedTodo] = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )

  expect(savedSharedTodo).toBeTruthy()
  expect(savedSharedTodo).toMatchObject({
    todoId: todo.id,
    userId: sharedUser.id
  })
})

test.skip('todo-not-found', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const nonExistentTodoId = 9999
  const {share} = createCaller(authContext({db}, owner))

  // ACT & ASSERT
  await expect(
    share({
      todoId: nonExistentTodoId,
      userId: sharedUser.id
    })
  ).rejects.toThrow()
})

test.skip('user-not-found', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))
  const nonExistentUserId = 9999
  const {share} = createCaller(authContext({db}, owner))

  // ACT & ASSERT
  await expect(
    share({
      todoId: todo.id,
      userId: nonExistentUserId
    })
  ).rejects.toThrow()
})
