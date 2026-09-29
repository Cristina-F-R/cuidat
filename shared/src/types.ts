export type ProfileType = 'pet' | 'child' | 'adult' | 'custom'

export type ItemCategory = 'symptom' | 'trigger' | 'medication'

export type EventFilter = 'all' | 'symptoms' | 'triggers' | 'correlations'

export interface CalendarProfile {
  id: string
  name: string
  type: ProfileType
  avatarIcon: string
}

export interface HealthItemDefinition {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  isActive: boolean
}

export interface HealthEventLog {
  id: string
  calendarId: string
  itemDefinitionId: string
  loggedAt: string
  intensity: 1 | 2 | 3
  notes: string
}

export interface CalendarDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
}

export interface HealthEvent {
  id: string
  loggedAt: string
  [key: string]: unknown
}

export interface CorrelationMatch<TEvent extends { id: string; loggedAt: string } = HealthEvent> {
  triggerEvent: TEvent
  symptomEvent: TEvent
  deltaHours: number
}