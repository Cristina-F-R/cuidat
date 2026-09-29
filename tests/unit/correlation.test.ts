import { describe, expect, it } from 'vitest'
import { detectCorrelations } from '../../shared/src/correlation'
import type { HealthEvent } from '../../shared/src/types'

const trigger: HealthEvent = { id: 'trigger', loggedAt: '2026-01-01T00:00:00.000Z' }

describe('detectCorrelations', () => {
  it('matches a trigger that precedes a symptom inside the time window', () => {
    const symptom: HealthEvent = { id: 'symptom', loggedAt: '2026-01-02T00:00:00.000Z' }

    expect(detectCorrelations([trigger], [symptom])).toEqual([
      { triggerEvent: trigger, symptomEvent: symptom, deltaHours: 24 },
    ])
  })

  it('includes the exact maximum-window boundary and excludes later symptoms', () => {
    const atBoundary: HealthEvent = { id: 'boundary', loggedAt: '2026-01-03T00:00:00.000Z' }
    const outside: HealthEvent = { id: 'outside', loggedAt: '2026-01-03T00:01:00.000Z' }

    expect(detectCorrelations([trigger], [atBoundary, outside])).toHaveLength(1)
    expect(detectCorrelations([trigger], [atBoundary])[0]?.deltaHours).toBe(48)
  })

  it('ignores symptoms before their trigger and invalid timestamps', () => {
    const earlier: HealthEvent = { id: 'earlier', loggedAt: '2025-12-31T23:59:59.000Z' }
    const invalid: HealthEvent = { id: 'invalid', loggedAt: 'not-a-date' }

    expect(detectCorrelations([trigger], [earlier, invalid])).toEqual([])
  })
})