import type { HealthEventLog, HealthItemDefinition } from '@cuidat/shared'

export interface CalendarEntry {
  log: HealthEventLog
  item: HealthItemDefinition
}