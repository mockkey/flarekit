import { expect, test } from '@playwright/test'

test('Should return 200 response - /api/ping', async ({ page }) => {
  const response = await page.goto('/api/ping')
  expect(response?.status()).toBe(200)
  expect(await response?.json()).toEqual({"message":"pong"})
})
