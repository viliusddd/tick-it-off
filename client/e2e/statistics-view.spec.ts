import {test, expect} from '@playwright/test'

test('Statistics view displays correctly', async ({page}) => {
  // Navigate to statistics page
  await page.goto('/statistics')

  // Verify the statistics container is visible
  await expect(page.locator('[data-testid="statistics-container"]')).toBeVisible()

  // Verify the heading
  await expect(page.locator('[data-testid="statistics-heading"]')).toBeVisible()
  await expect(page.locator('[data-testid="statistics-heading"]')).toHaveText('Statistics')

  // Check that either stats are loaded or loading indicator is shown
  if (await page.locator('[data-testid="statistics-loading"]').isVisible()) {
    await expect(page.locator('[data-testid="statistics-loading"]')).toBeVisible()
    // Wait for loading to complete (timeout after 10 seconds)
    await page.waitForSelector('[data-testid="statistics-loading"]', {
      state: 'hidden',
      timeout: 10000
    })
  }

  // Verify the statistics grid is shown after loading
  await expect(page.locator('[data-testid="statistics-grid"]')).toBeVisible()

  // Verify the statistics cards are displayed
  await expect(page.locator('[data-testid="total-todos-card"]')).toBeVisible()
  await expect(page.locator('[data-testid="daily-average-card"]')).toBeVisible()
  await expect(page.locator('[data-testid="most-active-day-card"]')).toBeVisible()

  // Verify the card content (total todos count should be a number)
  const totalTodosCountText = await page.locator('[data-testid="total-todos-count"]').textContent()
  const totalTodosCount = totalTodosCountText ? parseInt(totalTodosCountText.trim()) : NaN
  expect(isNaN(totalTodosCount)).toBe(false)

  // Check if the daily average is displayed (should be a number with decimal)
  const dailyAverageText = await page.locator('[data-testid="daily-average-value"]').textContent()
  const dailyAverage = dailyAverageText ? parseFloat(dailyAverageText.trim()) : NaN
  expect(isNaN(dailyAverage)).toBe(false)

  // Check if either most active day data or no completions message is shown
  const hasMostActiveDay = await page.locator('[data-testid="most-active-day-data"]').isVisible()
  const hasNoCompletions = await page.locator('[data-testid="no-completions-message"]').isVisible()

  expect(hasMostActiveDay || hasNoCompletions).toBeTruthy()
})
