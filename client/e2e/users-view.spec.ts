import {test, expect} from '@playwright/test'

test('Users view displays correctly', async ({page}) => {
  // Navigate to users page
  await page.goto('/users')

  // Verify the users container is visible
  await expect(page.locator('[data-testid="users-container"]')).toBeVisible()

  // Verify the header content
  await expect(page.locator('[data-testid="users-header"]')).toBeVisible()

  // Verify the listbox is visible
  await expect(page.locator('[data-testid="users-listbox"]')).toBeVisible()

  // Check if the list contains users or shows empty message
  const hasUsers = (await page.locator('[data-testid^="user-item-"]').count()) > 0
  const hasEmptyMessage = await page.locator('[data-testid="no-users-message"]').isVisible()

  // Either we should have users or we should have the empty message
  expect(hasUsers || hasEmptyMessage).toBeTruthy()

  // If we have users, let's check if any of them are friends
  if (hasUsers) {
    const friendTagCount = await page.locator('[data-testid="friend-tag"]').count()
    console.log(`Found ${friendTagCount} friends in the list`)
  }
})
