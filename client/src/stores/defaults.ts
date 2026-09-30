import dayjs from 'dayjs'
import type { CalendarProfile, HealthEventLog, HealthItemDefinition } from '@cuidat/shared'

export const DEFAULT_PROFILE: CalendarProfile = {
  id: 'profile-luna',
  name: 'Luna',
  type: 'pet',
  avatarIcon: '🐕',
}

export const DEFAULT_ITEMS: HealthItemDefinition[] = [
  { id: 'vomiting', calendarId: DEFAULT_PROFILE.id, name: 'Vómitos', emoji: '🤢', category: 'symptom', isActive: true },
  { id: 'itching', calendarId: DEFAULT_PROFILE.id, name: 'Picor', emoji: '🐾', category: 'symptom', isActive: true },
  { id: 'low-energy', calendarId: DEFAULT_PROFILE.id, name: 'Poca energía', emoji: '🪫', category: 'symptom', isActive: true },
  { id: 'new-food', calendarId: DEFAULT_PROFILE.id, name: 'Comida nueva', emoji: '🥣', category: 'trigger', isActive: true },
  { id: 'park', calendarId: DEFAULT_PROFILE.id, name: 'Parque', emoji: '🌳', category: 'trigger', isActive: true },
  { id: 'medication', calendarId: DEFAULT_PROFILE.id, name: 'Medicación', emoji: '💊', category: 'medication', isActive: true },
]

export function createDefaultEvents(): HealthEventLog[] {
  const createEvent = (
    id: string,
    itemDefinitionId: string,
    daysAgo: number,
    hour: number,
    intensity: HealthEventLog['intensity'],
    notes: string,
  ): HealthEventLog => ({
    id,
    calendarId: DEFAULT_PROFILE.id,
    itemDefinitionId,
    loggedAt: dayjs().subtract(daysAgo, 'day').hour(hour).minute(15).second(0).toISOString(),
    intensity,
    notes,
  })

  return [
    createEvent('luna-food-1', 'new-food', 6, 18, 1, 'Cambio gradual de pienso.'),
    createEvent('luna-itching-1', 'itching', 6, 20, 2, 'Picor tras el cambio de alimento.'),
    createEvent('luna-park-1', 'park', 3, 17, 1, ''),
    createEvent('luna-vomiting-1', 'vomiting', 3, 20, 2, 'Una vez por la mañana.'),
    createEvent('luna-food-2', 'new-food', 1, 19, 1, ''),
  ]
}

export const DEMO_PROFILE: CalendarProfile = {
  id: 'profile-moby-demo',
  name: 'Moby',
  type: 'pet',
  avatarIcon: '🐕',
}

export const DEMO_ITEMS: HealthItemDefinition[] = [
  { id: 'demo-vomiting', calendarId: DEMO_PROFILE.id, name: 'Vómitos', emoji: '🤢', category: 'symptom', isActive: true },
  { id: 'demo-itching', calendarId: DEMO_PROFILE.id, name: 'Picor', emoji: '🐾', category: 'symptom', isActive: true },
  { id: 'demo-low-energy', calendarId: DEMO_PROFILE.id, name: 'Poca energía', emoji: '🪫', category: 'symptom', isActive: true },
  { id: 'demo-new-food', calendarId: DEMO_PROFILE.id, name: 'Comida nueva', emoji: '🥣', category: 'trigger', isActive: true },
  { id: 'demo-park', calendarId: DEMO_PROFILE.id, name: 'Parque', emoji: '🌳', category: 'trigger', isActive: true },
  { id: 'demo-medication', calendarId: DEMO_PROFILE.id, name: 'Medicación', emoji: '💊', category: 'medication', isActive: true },
]

export function createDemoEvents(): HealthEventLog[] {
  const now = dayjs()
  const createEvent = (
    id: string,
    itemDefinitionId: string,
    daysAgo: number,
    hour: number,
    intensity: HealthEventLog['intensity'],
    notes: string,
  ): HealthEventLog => ({
    id,
    calendarId: DEMO_PROFILE.id,
    itemDefinitionId,
    loggedAt: now.subtract(daysAgo, 'day').hour(hour).minute(10).second(0).toISOString(),
    intensity,
    notes,
  })

  return [
    createEvent('moby-food-1', 'demo-new-food', 8, 18, 1, 'Primer día con alimento nuevo.'),
    createEvent('moby-vomit-1', 'demo-vomiting', 7, 8, 2, 'Vómito durante la mañana.'),
    createEvent('moby-park-1', 'demo-park', 4, 16, 1, 'Paseo por una zona con hierba.'),
    createEvent('moby-itch-1', 'demo-itching', 3, 10, 2, 'Picor observado al día siguiente.'),
    createEvent('moby-food-2', 'demo-new-food', 2, 19, 1, 'Se repite la ración del alimento nuevo.'),
    createEvent('moby-low-energy-1', 'demo-low-energy', 1, 9, 2, 'Menos energía al despertar.'),
  ]
}