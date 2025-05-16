import {test, expect} from '@playwright/test'

test('Todo view displays correctly', async ({page}) => {
  // Navigate to todo page
  await page.goto('/todo')

  // Verify the todo container is visible
  await expect(page.locator('[data-testid="todo-view-container"]')).toBeVisible()

  // Verify the calendar is visible
  await expect(page.locator('[data-testid="todo-calendar"]')).toBeVisible()

  // Verify the new task component
  await expect(page.locator('[data-testid="new-task-component"]')).toBeVisible()

  // Check for the todo input
  await expect(page.locator('[data-testid="todo-input"]')).toBeVisible()

  // Check for either todo items, loading spinner, or empty message
  // Wait for the app to settle (loading to finish or empty message to appear)
  await page.waitForSelector(
    '[data-testid="loading-spinner"], [data-testid="empty-todos-message"], [data-testid^="todo-container-"]',
    {timeout: 5000}
  )

  const hasTodos = (await page.locator('[data-testid^="todo-container-"]').count()) > 0
  const isLoading = await page.locator('[data-testid="loading-spinner"]').isVisible()
  const isEmpty = await page.locator('[data-testid="empty-todos-message"]').isVisible()

  // We should have either todos, loading indicator, or empty message
  expect(hasTodos || isLoading || isEmpty).toBeTruthy()
})

test('Can add a new todo item', async ({page}) => {
  // Navigate to todo page
  await page.goto('/todo')

  // Create a unique todo text
  const todoText = `Test Todo ${Date.now()}`

  // Add a new todo
  await page.locator('[data-testid="todo-input"]').fill(todoText)
  await page.locator('[data-testid="todo-add-button"]').click()

  // Verify it was added
  await expect(page.getByText(todoText)).toBeVisible()

  // Clean up - find and delete the todo
  const todoItem = page.getByText(todoText)
  await todoItem.click()

  // Find the delete button (using non-testid selector since we're looking for a relative element)
  await page.locator('.text-red-500').first().click()
  await page.locator('.text-green-500').click()

  // Verify it was deleted
  await expect(page.getByText(todoText)).not.toBeVisible()
})
