import { expect, test } from '@playwright/test'

test('demo page loads and locale toggle updates content', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Inline translations that stay in code',
  )
  await expect(page.locator('.conversation h3')).toContainText('Good day, Mika.')
  await expect(page.locator('.demo-metrics strong').first()).toHaveText('EN')

  await page.getByLabel('Select language').selectOption('es')

  await expect(page.locator('.conversation h3')).toContainText('Buen dia, Mika.')
  await expect(page.locator('.demo-metrics strong').first()).toHaveText('ES')
})
