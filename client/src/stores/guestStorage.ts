import type {
  CalendarProfile,
  HealthEventLog,
  HealthItemDefinition,
  ItemCategory,
  ProfileType,
} from '@cuidat/shared'

export const GUEST_STORAGE_KEY = '@cuidat_guest_v1'

export interface GuestState {
  profiles: CalendarProfile[]
  activeProfileId: string | null
  itemDefinitions: HealthItemDefinition[]
  events: HealthEventLog[]
  authMode: 'guest' | 'demo'
}

const EMPTY_GUEST_STATE: GuestState = {
  profiles: [],
  activeProfileId: null,
  itemDefinitions: [],
  events: [],
  authMode: 'guest',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProfileType(value: unknown): value is ProfileType {
  return value === 'pet' || value === 'child' || value === 'adult' || value === 'custom'
}

function isItemCategory(value: unknown): value is ItemCategory {
  return value === 'symptom' || value === 'trigger' || value === 'medication'
}

function isProfile(value: unknown): value is CalendarProfile {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && isProfileType(value.type)
    && typeof value.avatarIcon === 'string'
}

function isItemDefinition(value: unknown): value is HealthItemDefinition {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.emoji === 'string'
    && isItemCategory(value.category)
    && typeof value.isActive === 'boolean'
}

function isEvent(value: unknown): value is HealthEventLog {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.calendarId === 'string'
    && typeof value.itemDefinitionId === 'string'
    && typeof value.loggedAt === 'string'
    && Number.isFinite(Date.parse(value.loggedAt))
    && (value.intensity === 1 || value.intensity === 2 || value.intensity === 3)
    && typeof value.notes === 'string'
}

export function readGuestState(): GuestState {
  try {
    const serialized = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!serialized) return { ...EMPTY_GUEST_STATE }
    const value: unknown = JSON.parse(serialized)
    if (!isRecord(value)) return { ...EMPTY_GUEST_STATE }

    return {
      profiles: Array.isArray(value.profiles) ? value.profiles.filter(isProfile) : [],
      activeProfileId: typeof value.activeProfileId === 'string' ? value.activeProfileId : null,
      itemDefinitions: Array.isArray(value.itemDefinitions) ? value.itemDefinitions.filter(isItemDefinition) : [],
      events: Array.isArray(value.events) ? value.events.filter(isEvent) : [],
      authMode: value.authMode === 'demo' ? 'demo' : 'guest',
    }
  } catch {
    return { ...EMPTY_GUEST_STATE }
  }
}

export function persistGuestField<K extends keyof GuestState>(field: K, value: GuestState[K]): void {
  try {
    const nextState = { ...readGuestState(), [field]: value }
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextState))
  } catch {
    // Storage may be unavailable in private browsing or when the device is full.
  }
}