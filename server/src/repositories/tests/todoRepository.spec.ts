import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {todoRepository} from '../todoRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repo = todoRepository(db)

test('findById returns todo when it exists', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))

  // ACT
  const result = await repo.findById(todo.id, user.id)

  // ASSERT
  expect(result).toEqual({
    id: todo.id,
    title: todo.title,
    createdAt: todo.createdAt,
    userId: user.id
  })
})

test('findById returns undefined when todo does not exist', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())

  // ACT
  const result = await repo.findById(999999, user.id)

  // ASSERT
  expect(result).toBeUndefined()
})

test('findAll returns paginated todos', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const todos = []

  // Create multiple todos
  const todoPromises = Array.from({length: 5}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  )
  const createdTodos = await Promise.all(todoPromises)
  todos.push(...createdTodos.map(result => result[0]))

  // ACT
  const result = await repo.findAll({offset: 0, limit: 3})

  // ASSERT
  expect(result.length).toBe(3)
  expect(result[0].id).toBeDefined()
  expect(result[0].title).toBeDefined()
  expect(result[0].createdAt).toBeDefined()
  expect(result[0].userId).toBeDefined()
})

test('findAllForUser returns todos for specific user', async () => {
  // ARRANGE
  const [user1] = await insertAll(db, 'user', fakeUser())
  const [user2] = await insertAll(db, 'user', fakeUser())

  // Create todos for user1
  const user1TodoPromises = Array.from({length: 3}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user1.id}))
  )
  await Promise.all(user1TodoPromises)

  // Create todos for user2
  const user2TodoPromises = Array.from({length: 2}, () =>
    insertAll(db, 'todo', fakeTodo({userId: user2.id}))
  )
  await Promise.all(user2TodoPromises)

  // ACT
  const result = await repo.findAllForUser({offset: 0, limit: 10}, user1.id)

  // ASSERT
  expect(result.length).toBe(3)
  result.forEach(todo => {
    expect(todo.userId).toBe(user1.id)
  })
})

test('create adds a new todo and returns it', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const newTodo = fakeTodo({userId: user.id})

  // ACT
  const result = await repo.create(newTodo)

  // ASSERT
  expect(result.id).toBeDefined()
  expect(result.title).toBe(newTodo.title)
  expect(result.userId).toBe(user.id)
  expect(result.createdAt).toBeDefined()

  // Verify it was saved to the database
  const dbTodo = await selectAll(db, 'todo', eb => eb('id', '=', result.id))
  expect(dbTodo.length).toBe(1)
  expect(dbTodo[0].title).toBe(newTodo.title)
})

test('update modifies a todo and returns the updated version', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))
  const updatedTitle = 'Updated Todo Title'

  // ACT
  const result = await repo.update({
    id: todo.id,
    userId: user.id,
    title: updatedTitle
  })

  // ASSERT
  expect(result.id).toBe(todo.id)
  expect(result.title).toBe(updatedTitle)
  expect(result.userId).toBe(user.id)

  // Verify it was updated in the database
  const dbTodo = await selectAll(db, 'todo', eb => eb('id', '=', todo.id))
  expect(dbTodo.length).toBe(1)
  expect(dbTodo[0].title).toBe(updatedTitle)
})

test('delete removes a todo', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: user.id}))

  // Verify todo exists
  const beforeDelete = await selectAll(db, 'todo', eb => eb('id', '=', todo.id))
  expect(beforeDelete.length).toBe(1)

  // ACT
  await repo.delete(todo.id, user.id)

  // ASSERT
  const afterDelete = await selectAll(db, 'todo', eb => eb('id', '=', todo.id))
  expect(afterDelete.length).toBe(0)
})

test('getTotalTodoCount returns the correct count', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const initialCount = await repo.getTotalTodoCount()

  // Add 3 todos
  const todoPromises = [
    insertAll(db, 'todo', fakeTodo({userId: user.id})),
    insertAll(db, 'todo', fakeTodo({userId: user.id})),
    insertAll(db, 'todo', fakeTodo({userId: user.id}))
  ]
  await Promise.all(todoPromises)

  // ACT
  const finalCount = await repo.getTotalTodoCount()
  // ASSERT
  expect(Number(finalCount)).toBe(Number(initialCount) + 3)
})
