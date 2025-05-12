import {authContext, requestContext} from '@tests/utils/context'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll, selectAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const {update} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(update({id: 1, title: 'Foo'})).rejects.toThrow(/unauthenticated/i)
})

it('should persist the updated title', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const updatedTodo = {id: todo.id, title: 'FooBar'}
  const {update} = createCaller(authContext({db}, user))

  // ACT
  const todoReturned = await update(updatedTodo)

  // ASSERT
  expect(todoReturned).toMatchObject(updatedTodo)

  const [todoCreated] = await selectAll(db, 'todo', eb => eb('id', '=', todoReturned.id))

  expect(todoCreated).toMatchObject(todoReturned)
})
