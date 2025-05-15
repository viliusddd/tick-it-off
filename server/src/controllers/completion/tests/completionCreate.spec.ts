import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {requestContext} from '@tests/utils/context'
import completionRouter from '..'

const createCaller = createCallerFactory(completionRouter)
const db = await wrapInRollbacks(createTestDatabase())

// Helper to create test date strings in YYYY-MM-DD format
const TODAY = new Date().toISOString().split('T')[0]

test('create adds a new completion', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const {create} = createCaller(requestContext({db}))

  // Verify completion doesn't exist
  const beforeCreate = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(beforeCreate.length).toBe(0)

  // ACT
  const result = await create({todoId: todo.id, date: TODAY})

  // ASSERT
  expect(result.todoId).toBe(todo.id)
  expect(result.date).toBe(TODAY)

  // Verify it was created in the database
  const afterCreate = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(afterCreate.length).toBe(1)
})

test('create with non-existent todo throws error', async () => {
  // ARRANGE
  const {create} = createCaller(requestContext({db}))
  const nonExistentTodoId = 99999

  // ACT & ASSERT
  await expect(
    create({
      todoId: nonExistentTodoId,
      date: TODAY
    })
  ).rejects.toThrow()
})

test('create with invalid data throws error', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const {create} = createCaller(requestContext({db}))

  // ACT & ASSERT - Invalid date format
  await expect(
    create({
      todoId: todo.id,
      date: 'not-a-valid-date'
    })
  ).rejects.toThrow()
})
