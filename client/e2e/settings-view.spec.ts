import {test, expect} from '@playwright/test'

test('Settings view displays correctly', async ({page}) => {
  // Navigate to settings page
  await page.goto('/settings')

  // Verify the settings container is visible
  await expect(page.locator('[data-testid="settings-container"]')).toBeVisible()

  // Verify both sections are visible
  await expect(page.locator('[data-testid="profile-info-section"]')).toBeVisible()
  await expect(page.locator('[data-testid="password-change-section"]')).toBeVisible()

  // Verify the profile form is loaded
  await expect(page.locator('[data-testid="profile-form"]')).toBeVisible()

  // Check profile form inputs
  await expect(page.locator('[data-testid="firstName-input"]')).toBeVisible()
  await expect(page.locator('[data-testid="lastName-input"]')).toBeVisible()
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible()

  // Verify profile form buttons
  await expect(page.locator('[data-testid="profile-reset-button"]')).toBeVisible()
  await expect(page.locator('[data-testid="profile-update-button"]')).toBeVisible()

  // Verify password form
  await expect(page.locator('[data-testid="password-form"]')).toBeVisible()

  // Check password form containers (PrimeVue Password components)
  await expect(page.locator('[data-testid="current-password-input"]')).toBeVisible()
  await expect(page.locator('[data-testid="new-password-input"]')).toBeVisible()
  await expect(page.locator('[data-testid="repeat-password-input"]')).toBeVisible()

  // Verify password form buttons
  await expect(page.locator('[data-testid="password-reset-button"]')).toBeVisible()
  await expect(page.locator('[data-testid="password-update-button"]')).toBeVisible()
})

test('Profile form email validation works', async ({page}) => {
  // Navigate to settings page
  await page.goto('/settings')

  // Test email validation by entering an invalid email
  // Need to clear the field first
  await page.locator('[data-testid="email-input"]').clear()
  await page.locator('[data-testid="email-input"]').fill('invalid-email')

  // Click outside the field to trigger validation
  await page.locator('[data-testid="profile-update-button"]').click()

  // The email error should be visible
  await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
})
