import { expect, test } from 'playwright/test'

test.describe('Phase 1 dashboard', () => {
  test('supports desktop drag-and-drop event creation', async ({ page }, testInfo) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.setViewportSize({ width: 1440, height: 1100 })
    await page.goto('http://127.0.0.1:5173/')

    await expect(page.locator('.day-cell')).toHaveCount(42)
    await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true })
    await page.locator('.dock-item').first().dragTo(page.locator('.day-cell').nth(10))
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.locator('#event-notes').fill('Prueba de registro')
    await page.getByRole('button', { name: 'Guardar registro' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.getByRole('button', { name: 'Coincidencias', exact: true }).click()
    await expect(page.locator('.day-event').first()).toBeVisible()
    expect(pageErrors).toEqual([])
  })

  test('uses tap-to-select on a narrow viewport without horizontal overflow', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://127.0.0.1:5173/')
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true })

    await page.locator('.dock-item').first().click()
    await expect(page.locator('.selected-hint')).toContainText('toca un día')
    await page.locator('.day-cell').nth(20).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})