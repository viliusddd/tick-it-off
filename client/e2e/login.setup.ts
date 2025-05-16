import {test as setup, expect} from '@playwright/test'

const TEST_EMAIL = 'test-email@example.com'
const TEST_PASSWORD = 'Password123!'

setup('authenticate and store state', async ({page}) => {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(TEST_EMAIL)
  await page.locator('input[name="password"]').fill(TEST_PASSWORD)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL('/todo')
  await expect(page.locator('[data-testid="todo-add-button"]')).toBeVisible()
  await page.context().storageState({path: 'playwright/.auth.json'})
})
