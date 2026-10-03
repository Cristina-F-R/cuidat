import { describe, expect, it } from 'vitest'
import { loginSchema, upgradeSchema } from '../../server/src/schemas/auth.schemas'

const validState = {
  profiles: [{ id: 'local-profile', name: 'Moby', type: 'pet', avatarIcon: '🐕' }],
  activeProfileId: 'local-profile',
  itemDefinitions: [{ id: 'local-item', calendarId: 'local-profile', name: 'Picor', emoji: '🐾', category: 'symptom', isActive: true }],
  events: [{ id: 'local-event', calendarId: 'local-profile', itemDefinitionId: 'local-item', loggedAt: '2026-09-12T10:00:00.000Z', intensity: 2, notes: '' }],
  authMode: 'guest',
}

describe('authentication request schemas', () => {
  it('normalizes email and accepts passwords from eight characters', () => {
    expect(loginSchema.parse({ email: ' DEMO@CUIDAT.APP ', password: 'Demo1234' }).email).toBe('demo@cuidat.app')
  })

  it('rejects short passwords and unknown fields', () => {
    expect(loginSchema.safeParse({ email: 'demo@cuidat.app', password: 'short' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'demo@cuidat.app', password: 'password123', admin: true }).success).toBe(false)
  })

  it('rejects local events that point outside the submitted tenant payload', () => {
    const invalidState = {
      ...validState,
      events: [{ ...validState.events[0], calendarId: 'another-profile' }],
    }
    expect(upgradeSchema.safeParse({ email: 'new@cuidat.app', password: 'Demo1234', guestState: invalidState }).success).toBe(false)
  })

  it('rejects timestamps that are not UTC', () => {
    const invalidState = {
      ...validState,
      events: [{ ...validState.events[0], loggedAt: '2026-09-12T10:00:00+02:00' }],
    }
    expect(upgradeSchema.safeParse({ email: 'new@cuidat.app', password: 'Demo1234', guestState: invalidState }).success).toBe(false)
  })
})