import {test, expect} from '@playwright/test'
import {addTodo, editTodoTitle, deleteTodo} from './test-helpers'

// Navigate to the todo page before each test
test.beforeEach(async ({page}) => {
  await page.goto('/todo')
  // Wait for the page to be fully loaded
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})
})

test('Should add todo item', async ({page}) => {
  const todoText = `Buy groceries ${Date.now()}`

  // Add todo with unique name to avoid conflicts
  const todoId = await addTodo(page, todoText)

  // Verify todo was added
  await expect(page.getByText(todoText)).toBeVisible()

  // Clean up
  await deleteTodo(page, todoId)
})

test('Should edit todo item', async ({page}) => {
  const originalText = `Task to edit ${Date.now()}`
  const editedText = `Edited task ${Date.now()}`

  // Add new todo with unique name
  const todoId = await addTodo(page, originalText)

  // Edit the todo
  await editTodoTitle(page, todoId, editedText)

  // Assert that the todo item has been updated
  await expect(page.getByText(editedText)).toBeVisible()
  await expect(page.getByText(originalText)).not.toBeVisible()

  // Clean up
  await deleteTodo(page, todoId)
})

test('Should delete todo item', async ({page}) => {
  const todoText = `Task to delete ${Date.now()}`

  // Add new todo with unique name
  const todoId = await addTodo(page, todoText)

  // Verify it was added
  await expect(page.getByText(todoText)).toBeVisible()

  // Delete the todo
  await deleteTodo(page, todoId)

  // Assert that the todo item has been deleted
  await expect(page.getByText(todoText)).not.toBeVisible()
})
