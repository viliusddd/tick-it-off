import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll} from '@tests/utils/records'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {requestContext} from '@tests/utils/context'
import completionRouter from '..'

const createCaller = createCallerFactory(completionRouter)
const db = await wrapInRollbacks(createTestDatabase())

// Helper to create test date strings in YYYY-MM-DD format
const TODAY = new Date().toISOString().split('T')[0]
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]

test('findByRange returns completions within range for specific date', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  // Create todos with sequential IDs
  const todoPromises = Array.from({length: 5}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  )
  const todos = await Promise.all(todoPromises)
  const todoIds = todos.map(todo => todo[0].id).sort((a, b) => a - b)

  // Create completions for todos 1, 3, and 5 for TODAY
  await insertAll(db, 'completion', {todoId: todoIds[0], date: TODAY})
  await insertAll(db, 'completion', {todoId: todoIds[2], date: TODAY})
  await insertAll(db, 'completion', {todoId: todoIds[4], date: TODAY})

  // Create completion for todo 2 for YESTERDAY (should not be returned)
  await insertAll(db, 'completion', {todoId: todoIds[1], date: YESTERDAY})

  const {findByRange} = createCaller(requestContext({db}))

  // ACT
  const result = await findByRange({
    firstId: todoIds[0],
    secondId: todoIds[3],
    date: TODAY
  })

  // ASSERT
  expect(result.length).toBe(2)

  const resultIds = result.map(item => item.todoId)
  expect(resultIds).toContain(todoIds[0])
  expect(resultIds).toContain(todoIds[2])
  expect(resultIds).not.toContain(todoIds[4]) // Outside range
  expect(resultIds).not.toContain(todoIds[1]) // Different date
})

test('findByRange returns empty array when no completions in range', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  // Create todos
  const [todo1] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const [todo2] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))

  // No completions created

  const {findByRange} = createCaller(requestContext({db}))

  // ACT
  const result = await findByRange({
    firstId: todo1.id,
    secondId: todo2.id,
    date: TODAY
  })

  // ASSERT
  expect(result.length).toBe(0)
})
