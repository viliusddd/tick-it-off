import {test, expect} from '@playwright/test'

test('Create, rename, delete item', async ({page}) => {
  await page.goto('/todo')
  await page.getByRole('textbox', {name: 'Add a new task...'}).click()
  await page.getByRole('textbox', {name: 'Add a new task...'}).fill('FooBar')
  await page.getByRole('textbox', {name: 'Add a new task...'}).press('Enter')
  await page.getByRole('button', {name: 'Edit or share with others'}).first().click()
  await page.getByRole('textbox', {name: 'Todo title'}).click()
  await page.getByRole('textbox', {name: 'Todo title'}).fill('FooBarBaz')
  await page.getByRole('textbox', {name: 'Todo title'}).press('Enter')
  await page.getByRole('button', {name: ''}).click()
  await page.getByRole('button', {name: 'Close'}).click()
  await page.locator('.text-red-500').first().click()
  await page.locator('.text-green-500').click()
})
