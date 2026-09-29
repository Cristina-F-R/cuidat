import type { CorrelationMatch } from './types'

export function detectCorrelations<TEvent extends { id: string; loggedAt: string }>(
  triggers: TEvent[],
  symptoms: TEvent[],
  maxWindowHours: number = 48,
): CorrelationMatch<TEvent>[] {
  const matches: CorrelationMatch<TEvent>[] = []

  for (const symptom of symptoms) {
    const symptomTime = new Date(symptom.loggedAt).getTime()
    if (!Number.isFinite(symptomTime)) continue

    for (const trigger of triggers) {
      const triggerTime = new Date(trigger.loggedAt).getTime()
      if (!Number.isFinite(triggerTime)) continue

      const diffHours = (symptomTime - triggerTime) / (1000 * 60 * 60)
      if (diffHours >= 0 && diffHours <= maxWindowHours) {
        matches.push({
          triggerEvent: trigger,
          symptomEvent: symptom,
          deltaHours: Math.round(diffHours * 10) / 10,
        })
      }
    }
  }

  return matches.sort((left, right) => left.deltaHours - right.deltaHours)
}