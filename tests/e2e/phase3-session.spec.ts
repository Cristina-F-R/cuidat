import { expect, test } from 'playwright/test'

const clientOrigin = 'http://127.0.0.1:5173'
const fakeToken = 'phase31-test-token'

async function installAuthMocks(page: import('playwright/test').Page): Promise<void> {
  await page.route('http://localhost:3000/api/auth/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': clientOrigin,
          'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'access-control-allow-headers': 'content-type,authorization',
        },
      })
      return
    }
    if (request.url().endsWith('/auth/login')) {
      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': clientOrigin, 'content-type': 'application/json' },
        body: JSON.stringify({ success: true, data: { token: fakeToken, email: 'privacy@example.test' } }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': clientOrigin, 'content-type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Cuenta y datos asociados eliminados permanentemente.' }),
    })
  })
}

async function signIn(page: import('playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await page.locator('#auth-email').fill('privacy@example.test')
  await page.locator('#auth-password').fill('Temporary123!')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByText('Sincronizado')).toBeVisible()
}

async function readGuestCollections(page: import('playwright/test').Page): Promise<{ profiles: unknown[]; itemDefinitions: unknown[]; events: unknown[] }> {
  return page.evaluate(() => {
    const serialized = localStorage.getItem('@cuidat_guest_v1')
    if (!serialized) throw new Error('Guest state was not persisted.')
    const value: unknown = JSON.parse(serialized)
    if (typeof value !== 'object' || value === null) throw new Error('Guest state is invalid.')
    const record = value as Record<string, unknown>
    return {
      profiles: Array.isArray(record.profiles) ? record.profiles : [],
      itemDefinitions: Array.isArray(record.itemDefinitions) ? record.itemDefinitions : [],
      events: Array.isArray(record.events) ? record.events : [],
    }
  })
}

test.describe('Phase 3.1 account session and privacy', () => {
  test('exports data and clears authenticated session on logout', async ({ page }) => {
    await installAuthMocks(page)
    await page.goto(clientOrigin)
    await signIn(page)

    await page.getByRole('button', { name: /privacy@example.test/ }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'Descargar mis datos (JSON)' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^cuidat_backup_\d{4}-\d{2}-\d{2}\.json$/)

    await page.getByRole('button', { name: /privacy@example.test/ }).click()
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()
    await expect(page.getByText('Modo Local')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('@cuidat_auth_token_v1'))).toBeNull()
    expect(await page.evaluate(() => localStorage.getItem('@cuidat_auth_email_v1'))).toBeNull()
    const guestState = await readGuestCollections(page)
    expect(guestState.profiles).toEqual([])
    expect(guestState.itemDefinitions).toEqual([])
    expect(guestState.events).toEqual([])
  })

  test('requires exact ELIMINAR text before sending account erasure', async ({ page }) => {
    await installAuthMocks(page)
    await page.goto(clientOrigin)
    await signIn(page)
    await page.getByRole('button', { name: /privacy@example.test/ }).click()
    await page.getByRole('menuitem', { name: 'Eliminar cuenta y datos' }).click()

    const confirmation = page.locator('#delete-account-confirmation')
    const deleteButton = page.getByRole('button', { name: 'Eliminar permanentemente' })
    await expect(deleteButton).toBeDisabled()
    await confirmation.fill('eliminar')
    await expect(deleteButton).toBeDisabled()
    await confirmation.fill('ELIMINAR')
    await expect(deleteButton).toBeEnabled()
    await deleteButton.click()

    await expect(page.getByText('Modo Local')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('@cuidat_auth_token_v1'))).toBeNull()
    const guestState = await readGuestCollections(page)
    expect(guestState.profiles).toEqual([])
    expect(guestState.itemDefinitions).toEqual([])
    expect(guestState.events).toEqual([])
  })
})
