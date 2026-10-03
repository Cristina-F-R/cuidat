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
    await expect(page.locator('.day-event').filter({ hasText: 'Vómitos' })).toBeVisible()
    await page.getByRole('button', { name: 'Coincidencias', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Todo', exact: true })).toHaveAttribute('aria-pressed', 'false')
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

  test('loads a correlated Moby demo and locks editing in consultation mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 })
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page.locator('#auth-email')).toBeVisible()
    await expect(page.locator('#auth-password')).toBeVisible()
    await page.getByRole('button', { name: 'Acceso Demo / Evaluador (1-click)' }).click()

    await expect(page.locator('.profile-copy')).toContainText('Moby')
    await page.getByRole('checkbox', { name: 'Modo Consulta' }).check()
    await expect(page.locator('.workspace-shell')).toHaveClass(/consultation-layout/)
    await expect(page.locator('.dock-region')).toHaveCount(0)
    await expect(page.locator('.day-event').first()).toBeVisible()
    await page.locator('.day-event').first().click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.locator('.day-cell').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('edits an event and sanitizes notes before guest persistence', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.locator('.day-event').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Eliminar registro' })).toBeVisible()
    await page.locator('#event-notes').fill('<img src=x onerror=alert(1)> revisión')
    await page.locator('#event-time').fill('11:45')
    await page.locator('#event-intensity').selectOption('3')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await page.reload()

    const storedEvents = await page.evaluate(() => {
      const stored = localStorage.getItem('@cuidat_guest_v1')
      const guestState: { events: Array<{ notes: string; intensity: number; loggedAt: string }> } = JSON.parse(stored ?? '{"events":[]}')
      return guestState.events
    })
    const editedEvent = storedEvents.find((event) => event.notes === ' revisión')
    expect(editedEvent).toBeDefined()
    expect(editedEvent?.notes.includes('<img')).toBe(false)
    expect(editedEvent?.intensity).toBe(3)
    expect(new Date(editedEvent?.loggedAt ?? '').toISOString()).toBe(editedEvent?.loggedAt)
  })

  test('adds catalogue entries and cascades confirmed definition deletion', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await page.getByRole('button', { name: 'Acceso Demo / Evaluador (1-click)' }).click()
    await page.getByRole('tab', { name: 'Síntomas' }).click()
    await page.getByRole('button', { name: 'Añadir elemento' }).click()
    await page.locator('#definition-name').fill('Ojos irritados')
    await page.getByRole('button', { name: '🥕 Alimentos' }).click()
    await page.getByRole('button', { name: 'Añadir', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Ojos irritados, síntoma' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ojos irritados, síntoma' })).toContainText('🥕')

    for (let index = 0; index < 11; index += 1) {
      await page.getByRole('button', { name: 'Añadir elemento' }).click()
      await page.locator('#definition-name').fill(`Síntoma ${index + 1}`)
      await page.getByRole('button', { name: 'Añadir', exact: true }).click()
    }
    await expect(page.locator('.item-count')).toHaveText('15 / 15')
    await expect(page.getByRole('button', { name: 'Añadir elemento' })).toBeDisabled()

    await page.getByRole('tab', { name: 'Desencadenantes' }).click()
    await page.getByRole('button', { name: 'Eliminar Comida nueva' }).click()
    const cascadeDialog = page.getByRole('alertdialog')
    await expect(cascadeDialog).toBeVisible()
    await expect(cascadeDialog).toContainText('Comida nueva')
    await expect(cascadeDialog).toContainText('2 registros asociados')
    await cascadeDialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(cascadeDialog).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Comida nueva, desencadenante' })).toBeVisible()

    await page.getByRole('button', { name: 'Eliminar Comida nueva' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar 2 registros' }).click()
    await expect(page.getByRole('button', { name: 'Comida nueva, desencadenante' })).toHaveCount(0)
    const linkedEvents = await page.evaluate(() => {
      const stored = localStorage.getItem('@cuidat_guest_v1')
      const guestState: { events: Array<{ itemDefinitionId: string }> } = JSON.parse(stored ?? '{"events":[]}')
      return guestState.events.filter((event) => event.itemDefinitionId === 'demo-new-food')
    })
    expect(linkedEvents).toEqual([])
  })

  test('integrates dock edit and delete actions inside category-colored cards without a grip marker', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    const row = page.locator('.dock-item-row.symptom').first()
    await expect(row.locator('.edit-item')).toBeVisible()
    await expect(row.locator('.delete-item')).toBeVisible()
    await expect(page.locator('.dock-item-grip')).toHaveCount(0)
    await expect(row).toHaveCSS('background-color', 'rgb(255, 219, 187)')
  })

  test('opens the active profile menu and creates a profile with an isolated catalogue', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: /Luna/ }).click()
    await expect(page.getByText('No hay más calendarios registrados')).toBeVisible()
    await page.getByRole('button', { name: 'Nuevo calendario' }).click()
    await page.locator('#profile-name').fill('Milo')
    await page.getByRole('button', { name: 'Usar 🐱 como icono del perfil' }).click()
    await page.getByRole('button', { name: 'Crear calendario' }).click()

    await expect(page.locator('.profile-copy')).toContainText('Milo')
    await expect(page.locator('.profile-avatar')).toHaveText('🐱')
    await expect(page.locator('.dock-item')).toHaveCount(0)
    await page.getByRole('button', { name: /Milo/ }).click()
    await page.getByRole('menuitem', { name: 'Luna' }).click()
    await expect(page.locator('.profile-copy')).toContainText('Luna')
    await expect(page.locator('.dock-item')).not.toHaveCount(0)
  })

  test('opens a chronological day summary from free cell space, not from an event dot', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    const populatedDay = page.locator('.day-cell').filter({ has: page.locator('.day-event') }).first()
    await populatedDay.click({ position: { x: 20, y: 5 } })
    const summary = page.getByRole('dialog')
    await expect(summary).toBeVisible()
    await expect(summary.getByText('RESUMEN DEL DÍA')).toBeVisible()
    await expect(summary.locator('.event-row')).not.toHaveCount(0)
    const times = await summary.locator('.event-row time').allTextContents()
    expect(times).toEqual([...times].sort())
    await expect(summary.locator('.event-row time').first()).toHaveText(/\d{2}:\d{2}/)
    await expect(summary.locator('.intensity-1, .intensity-2, .intensity-3').first()).toBeVisible()
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.locator('.day-event').first().click()
    await expect(page.getByRole('button', { name: 'Eliminar registro' })).toBeVisible()
    await expect(page.getByText('RESUMEN DEL DÍA')).toHaveCount(0)
  })

  test('uses slate text on mint trigger badges and peach symptom badges', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/')
    const symptomCard = page.locator('.dock-item-row.symptom').first()
    const symptomBadge = symptomCard.locator('.dock-item')
    const symptomColors = await symptomBadge.evaluate((element) => ({
      color: getComputedStyle(element).color,
    }))
    await expect(symptomCard).toHaveCSS('background-color', 'rgb(255, 219, 187)')
    expect(symptomColors.color).toBe('rgb(73, 101, 128)')

    await page.getByRole('tab', { name: 'Desencadenantes' }).click()
    const triggerCard = page.locator('.dock-item-row.trigger').first()
    const triggerBadge = triggerCard.locator('.dock-item')
    const triggerColors = await triggerBadge.evaluate((element) => ({
      color: getComputedStyle(element).color,
    }))
    await expect(triggerCard).toHaveCSS('background-color', 'rgb(186, 255, 245)')
    expect(triggerColors.color).toBe('rgb(73, 101, 128)')
  })

  test('edits a catalog definition and updates historical calendar events reactively', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-20T12:00:00.000Z') })
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await page.getByRole('button', { name: 'Acceso Demo / Evaluador (1-click)' }).click()

    await page.getByRole('button', { name: 'Todo', exact: true }).click()
    await page.getByRole('tab', { name: 'Desencadenantes' }).click()
    await page.getByRole('button', { name: /Editar Comida nueva/ }).click()
    await page.locator('#definition-name').fill('Alimento actualizado')
    await page.locator('#definition-category').selectOption('medication')
    await page.getByRole('button', { name: '🧴 Medicación' }).click()
    await page.getByRole('button', { name: 'Guardar cambios' }).click()

    const updatedEvents = page.locator('.day-event.medication').filter({ hasText: 'Alimento actualizado' })
    await expect(updatedEvents).toHaveCount(2)
    await expect(updatedEvents.first()).toContainText('🧴')
    await updatedEvents.first().click()
    const medicationIcon = page.locator('.modal-item-icon')
    await expect(medicationIcon).toHaveClass(/medication/)
    await expect(medicationIcon).toHaveCSS('background-color', 'rgb(186, 221, 255)')
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.locator('.day-event.symptom').first().click()
    await expect(page.locator('.modal-item-icon')).toHaveClass(/symptom/)
    await expect(page.locator('.modal-item-icon')).toHaveCSS('background-color', 'rgb(255, 219, 187)')
    await page.getByRole('button', { name: 'Cerrar' }).click()

    await page.locator('.day-event.trigger').first().click()
    await expect(page.locator('.modal-item-icon')).toHaveClass(/trigger/)
    await expect(page.locator('.modal-item-icon')).toHaveCSS('background-color', 'rgb(186, 255, 245)')
  })

  test('keeps the expanded emoji palette and save actions within a short mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('tab', { name: 'Síntomas' }).click()
    await page.getByRole('button', { name: 'Añadir elemento' }).click()

    const modal = page.locator('.definition-modal')
    const saveButton = page.getByRole('button', { name: 'Añadir', exact: true })
    await expect(modal).toBeVisible()
    await expect(saveButton).toBeInViewport()
    const modalBounds = await modal.boundingBox()
    expect(modalBounds).not.toBeNull()
    expect(modalBounds!.y).toBeGreaterThanOrEqual(0)
    expect(modalBounds!.y + modalBounds!.height).toBeLessThanOrEqual(568)

    await page.getByRole('button', { name: '💧 Medicación' }).click()
    await expect(page.getByRole('button', { name: '💧 Medicación' })).toHaveAttribute('aria-pressed', 'true')
  })
})