import {test, expect} from '@playwright/test'
import {addTodo, toggleTodoCompletion, editTodoTitle, deleteTodo} from './test-helpers'

// Add unique timestamp to todo names to avoid conflicts
const timestamp = Date.now()

// Authentication tests - running these tests separately since they don't require authentication
test('Should register new user', async ({page}) => {
  // Register a new user with unique email to avoid conflicts
  await page.goto('/signup')

  const email = `test-email-${timestamp}@example.com`
  const password = 'Password123!'

  await page.locator('input[name="firstName"]').fill('Test')
  await page.locator('input[name="lastName"]').fill('User')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('input[name="confirmPassword"]').fill(password)

  // Submit form and verify redirect
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL('/todo')
})

// Todo functionality tests - these work with the global authentication from playwright.config.ts
test('Should add todo item', async ({page}) => {
  // Navigate to todo page and wait for it to load
  await page.goto('/todo')
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Create a unique todo name to avoid conflicts
  const todoText = `Buy groceries ${timestamp}`

  // Add the todo and verify it was added
  const todoId = await addTodo(page, todoText)
  await expect(page.getByText(todoText)).toBeVisible()

  // Clean up - delete the todo
  await deleteTodo(page, todoId)
})

test('Should complete todo item', async ({page}) => {
  // Navigate to todo page and wait for it to load
  await page.goto('/todo')
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Create a unique todo name to avoid conflicts
  const todoText = `Task to complete ${timestamp}`

  // Add a new todo
  const todoId = await addTodo(page, todoText)

  // Mark it as completed and verify
  await toggleTodoCompletion(page, todoId, true)

  // Clean up - delete the todo
  await deleteTodo(page, todoId)
})

test('Should edit todo item', async ({page}) => {
  // Navigate to todo page and wait for it to load
  await page.goto('/todo')
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Create unique todo names to avoid conflicts
  const originalText = `Task to edit ${timestamp}`
  const editedText = `Edited task ${timestamp}`

  // Add a new todo
  const todoId = await addTodo(page, originalText)

  // Edit the todo's title
  await editTodoTitle(page, todoId, editedText)

  // Verify the title was updated
  await expect(page.getByText(editedText)).toBeVisible()
  await expect(page.getByText(originalText)).not.toBeVisible()

  // Clean up - delete the todo
  await deleteTodo(page, todoId)
})

test('Should delete todo item', async ({page}) => {
  // Navigate to todo page and wait for it to load
  await page.goto('/todo')
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Create a unique todo name to avoid conflicts
  const todoText = `Task to delete ${timestamp}`

  // Add a new todo
  const todoId = await addTodo(page, todoText)

  // Verify it was added
  await expect(page.getByText(todoText)).toBeVisible()

  // Delete the todo
  await deleteTodo(page, todoId)

  // Verify it was deleted
  await expect(page.getByText(todoText)).not.toBeVisible()
})

// UI navigation tests
test('Should display statistics view correctly', async ({page}) => {
  // Navigate to todo page and wait for it to load
  await page.goto('/todo')
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Navigate to statistics page
  await page.getByText('Statistics').click()

  // Verify we're on the statistics page
  await expect(page).toHaveURL('/statistics')

  // Verify statistics components are visible
  await expect(page.getByRole('heading', {name: 'Statistics'})).toBeVisible()
  await expect(page.getByText('Total Todos')).toBeVisible()
  await expect(page.getByText('Daily Average')).toBeVisible()
  await expect(page.getByText('Most Active Day')).toBeVisible()
})
