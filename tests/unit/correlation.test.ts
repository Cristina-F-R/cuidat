import { describe, expect, it } from 'vitest'
import { detectCorrelations } from '../../shared/src/correlation'
import type { HealthEvent } from '../../shared/src/types'

const trigger: HealthEvent = { id: 'trigger', loggedAt: '2026-01-01T00:00:00.000Z' }

describe('detectCorrelations', () => {
  it('matches an exact timestamp as a zero-hour correlation', () => {
    const symptom: HealthEvent = { id: 'symptom', loggedAt: trigger.loggedAt }

    expect(detectCorrelations([trigger], [symptom])).toEqual([
      { triggerEvent: trigger, symptomEvent: symptom, deltaHours: 0 },
    ])
  })

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

  it('supports a custom maximum window and excludes the next millisecond', () => {
    const withinWindow: HealthEvent = { id: 'within', loggedAt: '2026-01-01T01:30:00.000Z' }
    const outsideWindow: HealthEvent = { id: 'outside', loggedAt: '2026-01-01T01:30:00.001Z' }

    expect(detectCorrelations([trigger], [withinWindow, outsideWindow], 1.5)).toEqual([
      { triggerEvent: trigger, symptomEvent: withinWindow, deltaHours: 1.5 },
    ])
  })

  it('ignores symptoms before their trigger and invalid timestamps', () => {
    const earlier: HealthEvent = { id: 'earlier', loggedAt: '2025-12-31T23:59:59.000Z' }
    const invalid: HealthEvent = { id: 'invalid', loggedAt: 'not-a-date' }
    const invalidTrigger: HealthEvent = { id: 'invalid-trigger', loggedAt: 'not-a-date' }

    expect(detectCorrelations([trigger, invalidTrigger], [earlier, invalid])).toEqual([])
  })

  it('sorts by rounded delta while preserving input order for ties', () => {
    const laterTrigger: HealthEvent = { id: 'later-trigger', loggedAt: '2026-01-01T01:00:00.000Z' }
    const firstSymptom: HealthEvent = { id: 'first-symptom', loggedAt: '2026-01-01T02:00:00.000Z' }
    const secondSymptom: HealthEvent = { id: 'second-symptom', loggedAt: '2026-01-01T02:00:00.000Z' }

    expect(detectCorrelations([trigger, laterTrigger], [firstSymptom, secondSymptom])).toEqual([
      { triggerEvent: laterTrigger, symptomEvent: firstSymptom, deltaHours: 1 },
      { triggerEvent: laterTrigger, symptomEvent: secondSymptom, deltaHours: 1 },
      { triggerEvent: trigger, symptomEvent: firstSymptom, deltaHours: 2 },
      { triggerEvent: trigger, symptomEvent: secondSymptom, deltaHours: 2 },
    ])
  })

  it('rounds reported deltas to one decimal place', () => {
    const symptom: HealthEvent = { id: 'symptom', loggedAt: '2026-01-01T00:07:00.000Z' }

    expect(detectCorrelations([trigger], [symptom])[0]?.deltaHours).toBe(0.1)
  })

  it('returns no matches for empty collections or a negative window', () => {
    const symptom: HealthEvent = { id: 'symptom', loggedAt: trigger.loggedAt }

    expect(detectCorrelations([], [symptom])).toEqual([])
    expect(detectCorrelations([trigger], [])).toEqual([])
    expect(detectCorrelations([trigger], [symptom], -1)).toEqual([])
  })

  it('does not mutate the provided event arrays or objects', () => {
    const symptom: HealthEvent = { id: 'symptom', loggedAt: '2026-01-01T01:00:00.000Z' }
    const triggers = [trigger]
    const symptoms = [symptom]
    const triggerSnapshot = structuredClone(triggers)
    const symptomSnapshot = structuredClone(symptoms)

    detectCorrelations(triggers, symptoms)

    expect(triggers).toEqual(triggerSnapshot)
    expect(symptoms).toEqual(symptomSnapshot)
  })
})