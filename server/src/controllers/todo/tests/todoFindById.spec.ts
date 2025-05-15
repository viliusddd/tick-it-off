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
  const {findById} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(findById({id: 1})).rejects.toThrow(/unauthenticated/i)
})

test('success', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const {findById} = createCaller(authContext({db}, user))

  // ACT
  const foundTodo = await findById({id: todo.id})

  // ASSERT
  expect(foundTodo).toMatchObject({
    id: todo.id,
    title: todo.title,
    userId: user.id
  })
})

test.skip('not-found', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const {findById} = createCaller(authContext({db}, user))
  const nonExistentId = 9999

  // ACT & ASSERT
  await expect(findById({id: nonExistentId})).rejects.toThrow(/not found/i)
})

test.skip('no-access', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user1.id}))
  const {findById} = createCaller(authContext({db}, user2))

  // ACT & ASSERT
  await expect(findById({id: todo.id})).rejects.toThrow(/not found/i)
})
