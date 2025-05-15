import {authContext} from '@tests/utils/context'
import {fakeUser, fakeTodo} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

test('find todos for different users', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create todos for different users
  await insertAll(db, 'todo', [
    fakeTodo({userId: user1.id, title: 'User1 Todo1'}),
    fakeTodo({userId: user1.id, title: 'User1 Todo2'}),
    fakeTodo({userId: user2.id, title: 'User2 Todo1'}) // This should not be returned
  ])

  const user1Caller = createCaller(authContext({db}, user1))
  const user2Caller = createCaller(authContext({db}, user2))

  // ACT
  const user1Todos = await user1Caller.findAll()
  const user2Todos = await user2Caller.findAll()

  // ASSERT
  // User 1 should see their todos
  expect(user1Todos.length).toBe(2)
  user1Todos.forEach(todo => {
    expect(todo.userId).toBe(user1.id)
  })

  // User 2 should see their todo
  expect(user2Todos.length).toBe(1)
  expect(user2Todos[0].userId).toBe(user2.id)
})
