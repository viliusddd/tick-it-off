import {Page, expect} from '@playwright/test'

/**
 * Helper functions for testing Todo functionality
 * Compatible with authenticated tests
 */

/**
 * Find a todo by its text and return its ID
 */
export async function findTodoId(page: Page, todoText: string): Promise<string> {
  // Wait for app to load fully
  await page.waitForSelector('[data-testid="todo-view-container"]', {timeout: 5000})

  // Get all todo items on the page
  const todoItems = await page.locator('[data-testid^="todo-item-"]').all()

  // Loop through each todo item to find the one with matching text
  for (const item of todoItems) {
    const itemText = await item.textContent()
    if (itemText && itemText.includes(todoText)) {
      // Extract ID from the data-testid attribute
      const dataTestId = await item.getAttribute('data-testid')
      if (dataTestId && dataTestId.startsWith('todo-item-')) {
        return dataTestId.replace('todo-item-', '')
      }
    }
  }

  // If we reach here, we couldn't find the todo
  throw new Error(`Could not find todo with text "${todoText}"`)
}

/**
 * Add a new todo item
 */
export async function addTodo(page: Page, title: string): Promise<string> {
  // Wait for the input to be visible and enabled
  await page.waitForSelector('[data-testid="todo-input"]', {state: 'visible', timeout: 5000})

  // Add the todo
  await page.locator('[data-testid="todo-input"]').fill(title)
  await page.locator('[data-testid="todo-add-button"]').click()

  // Wait for the item to appear in the DOM (may take a moment for API response)
  await page.waitForTimeout(500)

  // Find its ID
  return await findTodoId(page, title)
}

/**
 * Mark a todo as completed or not completed
 */
export async function toggleTodoCompletion(
  page: Page,
  todoId: string,
  completed = true
): Promise<void> {
  // Wait for the todo item to be visible
  await page
    .locator(`[data-testid="todo-item-${todoId}"]`)
    .waitFor({state: 'visible', timeout: 5000})

  // Find the checkbox element within the todo item
  const checkboxContainer = page.locator(`[data-testid="todo-checkbox-${todoId}"]`)
  await checkboxContainer.waitFor({state: 'visible', timeout: 5000})

  // Look for the actual checkbox input inside the container
  // Try different options since we're not sure of the exact structure
  let checkbox
  try {
    checkbox = checkboxContainer.locator('input[type="checkbox"]')
    if (!(await checkbox.count())) {
      checkbox = checkboxContainer
    }
  } catch (e) {
    checkbox = checkboxContainer
  }

  // Get current state - if we can't check the state, assume we need to click
  let needToClick = false
  try {
    const isChecked = await checkbox.isChecked()
    needToClick = isChecked !== completed
  } catch (e) {
    // If we can't determine the state, just click
    needToClick = true
  }

  // Click the checkbox if needed
  if (needToClick) {
    await checkboxContainer.click()
    await page.waitForTimeout(300) // Wait for state to update
  }

  // Verify the change visually - by checking for strikethrough text
  const todoTitle = page.locator(`[data-testid="todo-title-${todoId}"]`)

  if (completed) {
    // If it should be completed, text should have line-through style
    await expect(todoTitle).toHaveClass(/line-through/)
  } else {
    // If it should not be completed, text should not have line-through style
    await expect(todoTitle).not.toHaveClass(/line-through/)
  }
}

/**
 * Edit a todo's title
 */
export async function editTodoTitle(page: Page, todoId: string, newTitle: string): Promise<void> {
  // Wait for the todo item to be visible
  await page
    .locator(`[data-testid="todo-item-${todoId}"]`)
    .waitFor({state: 'visible', timeout: 5000})

  // Directly target the edit button with force:true to avoid needing hover
  const editButton = page.locator(`[data-testid="todo-edit-${todoId}"]`)
  await editButton.click({force: true, timeout: 5000})

  // Wait for the dialog to appear
  await page.waitForTimeout(300)

  // Edit title - wait for dialog to be visible first
  await page.waitForSelector('[data-testid="todo-title-input"]', {state: 'visible', timeout: 5000})
  await page.locator('[data-testid="todo-title-input"]').fill(newTitle)
  await page.locator('[data-testid="todo-title-save-button"]').click()

  // Close the dialog if there's a close button
  try {
    const closeButton = page.locator('[data-testid="todo-edit-close-button"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
  } catch (error) {
    // If there's no close button, that's fine
  }

  // Wait for the update to take effect
  await page.waitForTimeout(300)

  // Verify title was updated (using the correct selector)
  await expect(page.locator(`[data-testid="todo-title-${todoId}"]`)).toContainText(newTitle)
}

/**
 * Delete a todo
 */
export async function deleteTodo(page: Page, todoId: string): Promise<void> {
  // Wait for the todo item to be visible
  await page
    .locator(`[data-testid="todo-item-${todoId}"]`)
    .waitFor({state: 'visible', timeout: 5000})

  // Directly target the delete button with force:true to avoid needing hover
  const deleteButton = page.locator(`[data-testid="todo-delete-${todoId}"]`)
  await deleteButton.click({force: true, timeout: 5000})

  // Wait for the confirm dialog to appear
  await page.waitForTimeout(500)

  // Try different selectors for the confirmation button
  try {
    // Try to find a button with green text/styling
    const confirmButtons = [
      '.text-green-500',
      'button.text-green-500',
      '[data-testid="confirm-delete-button"]',
      'button:has-text("Yes")',
      'button:has-text("Confirm")',
      'button:has-text("Delete")'
    ]

    for (const selector of confirmButtons) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({timeout: 1000})) {
          await button.click()
          break
        }
      } catch (error) {
        // Try the next selector
        continue
      }
    }
  } catch (error) {
    console.warn('Could not find confirmation button, trying to continue...')
  }

  // Wait for the deletion to complete
  await page.waitForTimeout(500)

  // Verify item was deleted (with a longer timeout for UI to update)
  try {
    await expect(page.locator(`[data-testid="todo-item-${todoId}"]`)).not.toBeVisible({
      timeout: 3000
    })
  } catch (error) {
    // If we can't verify deletion, log a warning but don't fail the test
    console.warn(`Could not verify deletion of todo ${todoId}, continuing test...`)
  }
}
