import {wrapInRollbacks} from '@tests/utils/transactions'
import {createTestDatabase} from '@tests/utils/database'
import {insertAll, selectAll} from '@tests/utils/records'
import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {sharedTodoRepository} from '../sharedTodoRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repo = sharedTodoRepository(db)

test('findAll returns paginated shared todos', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser1] = await insertAll(db, 'user', fakeUser())
  const [sharedUser2] = await insertAll(db, 'user', fakeUser())

  // Create todos and share them
  const [todo1] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))
  const [todo2] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  await insertAll(db, 'sharedTodo', {todoId: todo1.id, userId: sharedUser1.id})
  await insertAll(db, 'sharedTodo', {todoId: todo1.id, userId: sharedUser2.id})
  await insertAll(db, 'sharedTodo', {todoId: todo2.id, userId: sharedUser1.id})

  // ACT
  const result = await repo.findAll({offset: 0, limit: 5})

  // ASSERT
  expect(result.length).toBe(3)

  // Verify each result has the expected structure
  result.forEach(sharedTodo => {
    expect(sharedTodo.todoId).toBeDefined()
    expect(sharedTodo.userId).toBeDefined()
    expect(sharedTodo.createdAt).toBeDefined()
  })
})

test('findTodos returns todos shared with a specific user', async () => {
  // ARRANGE
  const [owner1] = await insertAll(db, 'user', fakeUser())
  const [owner2] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())

  // Create todos and share them
  const [todo1] = await insertAll(db, 'todo', fakeTodo({userId: owner1.id}))
  const [todo2] = await insertAll(db, 'todo', fakeTodo({userId: owner1.id}))
  const [todo3] = await insertAll(db, 'todo', fakeTodo({userId: owner2.id}))

  await insertAll(db, 'sharedTodo', {todoId: todo1.id, userId: sharedUser.id})
  await insertAll(db, 'sharedTodo', {todoId: todo3.id, userId: sharedUser.id})

  // ACT
  const result = await repo.findTodos(sharedUser.id)

  // ASSERT
  expect(result.length).toBe(2)

  // Verify todos are returned with correct structure
  const todoIds = result.map(todo => todo.id)
  expect(todoIds).toContain(todo1.id)
  expect(todoIds).toContain(todo3.id)
  expect(todoIds).not.toContain(todo2.id)

  result.forEach(todo => {
    expect(todo.id).toBeDefined()
    expect(todo.title).toBeDefined()
    expect(todo.createdAt).toBeDefined()
    expect(todo.userId).toBeDefined()
  })
})

test('findUsers returns user IDs a todo is shared with', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser1] = await insertAll(db, 'user', fakeUser())
  const [sharedUser2] = await insertAll(db, 'user', fakeUser())
  const [sharedUser3] = await insertAll(db, 'user', fakeUser())

  // Create todo and share it
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser1.id})
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser2.id})
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser3.id})

  // ACT
  const result = await repo.findUsers(todo.id)

  // ASSERT
  expect(result.length).toBe(3)

  const userIds = result.map(item => item.userId)
  expect(userIds).toContain(sharedUser1.id)
  expect(userIds).toContain(sharedUser2.id)
  expect(userIds).toContain(sharedUser3.id)
  expect(userIds).not.toContain(owner.id) // Owner is not in the shared list
})

test('create adds a new shared todo and returns it', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  const sharedTodoData = {
    todoId: todo.id,
    userId: sharedUser.id
  }

  // ACT
  const result = await repo.create(sharedTodoData)

  // ASSERT
  expect(result.todoId).toBe(todo.id)
  expect(result.userId).toBe(sharedUser.id)
  expect(result.createdAt).toBeDefined()

  // Verify it was saved to the database
  const dbSharedTodo = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(dbSharedTodo.length).toBe(1)
  expect(dbSharedTodo[0].todoId).toBe(todo.id)
  expect(dbSharedTodo[0].userId).toBe(sharedUser.id)
})

test('delete removes a shared todo', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // Share the todo
  await insertAll(db, 'sharedTodo', {todoId: todo.id, userId: sharedUser.id})

  // Verify shared todo exists
  const beforeDelete = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(beforeDelete.length).toBe(1)

  // ACT
  const result = await repo.delete({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // ASSERT
  expect(result).toEqual({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // Verify it was removed from the database
  const afterDelete = await selectAll(db, 'sharedTodo', eb =>
    eb('todoId', '=', todo.id).and('userId', '=', sharedUser.id)
  )
  expect(afterDelete.length).toBe(0)
})

test('delete returns undefined for non-existent shared todo', async () => {
  // ARRANGE
  const [owner] = await insertAll(db, 'user', fakeUser())
  const [sharedUser] = await insertAll(db, 'user', fakeUser())
  const [todo] = await insertAll(db, 'todo', fakeTodo({userId: owner.id}))

  // ACT - attempt to delete a share that doesn't exist
  const result = await repo.delete({
    todoId: todo.id,
    userId: sharedUser.id
  })

  // ASSERT
  expect(result).toBeUndefined()
})
