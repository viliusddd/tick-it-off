import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
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
  const todo = {id: 1, title: 'FooBar'}
  const [user] = await insertAll(db, 'user', fakeUser())
  const {update} = createCaller(authContext({db}, user))

  // ACT
  const todoReturned = await update(todo)

  // ASSERT
  expect(todoReturned).toMatchObject(todo)

  const [todoCreated] = await selectAll(db, 'todo', eb => eb('id', '=', todoReturned.id))

  expect(todoCreated).toMatchObject(todoReturned)
})
