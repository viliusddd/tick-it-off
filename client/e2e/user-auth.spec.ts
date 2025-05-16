import {test, expect} from '@playwright/test'

const TEST_EMAIL = 'test-email@example.com'
const TEST_PASSWORD = 'Password123!'

test('Should register new user', async ({page}) => {
  await page.goto('/signup')

  await page.locator('input[name="firstName"]').fill('Test')
  await page.locator('input[name="lastName"]').fill('User')
  await page.locator('input[name="email"]').fill(TEST_EMAIL)
  await page.locator('input[name="password"]').fill(TEST_PASSWORD)
  await page.locator('input[name="confirmPassword"]').fill(TEST_PASSWORD)

  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/todo')
})

test('Should login user with valid credentials', async ({page}) => {
  await page.goto('/login')

  await page.locator('input[name="email"]').fill(TEST_EMAIL)
  await page.locator('input[name="password"]').fill(TEST_PASSWORD)

  await page.locator('button[type="submit"]').click()

  await expect(page).toHaveURL('/todo')
})
