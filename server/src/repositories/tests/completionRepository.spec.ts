import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {completionRepository} from '../completionRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repo = completionRepository(db)

// Helper to create test date strings in YYYY-MM-DD format
const createDateString = (daysFromToday = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

const TODAY = createDateString()
const YESTERDAY = createDateString(-1)

test('findByRange returns completions within todoId range for specific date', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const todoPromises = Array.from({length: 5}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  )
  const todos = await Promise.all(todoPromises)
  const todoIds = todos.map(todo => todo[0].id).sort((a, b) => a - b)

  // Create completions for todos 1, 3, and 5
  await insertAll(db, 'completion', {todoId: todoIds[0], date: TODAY})
  await insertAll(db, 'completion', {todoId: todoIds[2], date: TODAY})
  await insertAll(db, 'completion', {todoId: todoIds[4], date: TODAY})

  // Create completion for yesterday (should not be returned)
  await insertAll(db, 'completion', {todoId: todoIds[1], date: YESTERDAY})

  // ACT
  const result = await repo.findByRange(todoIds[0], todoIds[3], TODAY)

  // ASSERT
  expect(result.length).toBe(2)
  const resultIds = result.map(item => item.todoId)
  expect(resultIds).toContain(todoIds[0])
  expect(resultIds).toContain(todoIds[2])
  expect(resultIds).not.toContain(todoIds[4]) // Outside range
  expect(resultIds).not.toContain(todoIds[1]) // Different date
})

test('findById returns completion when it exists', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  await insertAll(db, 'completion', {todoId: todo.id, date: TODAY})

  // ACT
  const result = await repo.findById({todoId: todo.id, date: TODAY})

  // ASSERT
  expect(result).toBeDefined()
  expect(result?.todoId).toBe(todo.id)
  expect(result?.date).toBe(TODAY)
})

test('findById returns undefined when completion does not exist', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))

  // ACT
  const result = await repo.findById({todoId: todo.id, date: TODAY})

  // ASSERT
  expect(result).toBeUndefined()
})

test('findAll returns paginated completions for specific date', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const todoPromises = Array.from({length: 5}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  )
  const todos = await Promise.all(todoPromises)

  // Create completions for today
  const completionPromises = todos.map(todo =>
    insertAll(db, 'completion', {todoId: todo[0].id, date: TODAY})
  )
  await Promise.all(completionPromises)

  // Create a completion for yesterday (should not be returned)
  await insertAll(db, 'completion', {todoId: todos[0][0].id, date: YESTERDAY})

  // ACT
  const result = await repo.findAll({date: TODAY, offset: 0, limit: 3})

  // ASSERT
  expect(result.length).toBe(3)
  result.forEach(completion => {
    expect(completion.date).toBe(TODAY)
    expect(completion.todoId).toBeDefined()
  })
})

test('create adds a new completion and returns it', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const completionData = {todoId: todo.id, date: TODAY}

  // ACT
  const result = await repo.create(completionData)

  // ASSERT
  expect(result.todoId).toBe(todo.id)
  expect(result.date).toBe(TODAY)

  // Verify it was saved to the database
  const dbCompletion = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(dbCompletion.length).toBe(1)
})

test('delete removes a completion', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  await insertAll(db, 'completion', {todoId: todo.id, date: TODAY})

  // Verify completion exists
  const beforeDelete = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(beforeDelete.length).toBe(1)

  // ACT
  await repo.delete({todoId: todo.id, date: TODAY})

  // ASSERT
  const afterDelete = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(afterDelete.length).toBe(0)
})

test('toggle creates a completion when it does not exist', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const completionData = {todoId: todo.id, date: TODAY}

  // Verify completion does not exist
  const beforeToggle = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(beforeToggle.length).toBe(0)

  // ACT
  await repo.toggle(completionData)

  // ASSERT - completion should be created
  const afterToggle = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(afterToggle.length).toBe(1)
})

test('toggle removes a completion when it exists', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const completionData = {todoId: todo.id, date: TODAY}

  // Create a completion
  await insertAll(db, 'completion', completionData)

  // Verify completion exists
  const beforeToggle = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(beforeToggle.length).toBe(1)

  // ACT
  await repo.toggle(completionData)

  // ASSERT - completion should be removed
  const afterToggle = await selectAll(db, 'completion', eb =>
    eb('todoId', '=', todo.id).and('date', '=', TODAY)
  )
  expect(afterToggle.length).toBe(0)
})

test('getDailyCompletions returns daily completion counts', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const todoPromises = Array.from({length: 3}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  )
  const todos = await Promise.all(todoPromises)

  // Create completions for today
  const todayCompletionPromises = todos.map(todo =>
    insertAll(db, 'completion', {todoId: todo[0].id, date: TODAY})
  )
  await Promise.all(todayCompletionPromises)

  // Create completions for yesterday
  await insertAll(db, 'completion', {todoId: todos[0][0].id, date: YESTERDAY})
  await insertAll(db, 'completion', {todoId: todos[1][0].id, date: YESTERDAY})

  // ACT
  const result = await repo.getDailyCompletions()

  // ASSERT
  expect(result.length).toBeGreaterThanOrEqual(1) // Should have at least one day

  // Check that each result has a date and count
  result.forEach(day => {
    expect(day.date).toBeDefined()
    expect(day.dailycount).toBeDefined()
  })
})
