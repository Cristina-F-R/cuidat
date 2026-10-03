import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import DOMPurify from 'dompurify'
import type { HealthEventLog } from '@cuidat/shared'
import { createDefaultEvents } from './defaults'
import { persistGuestField, readGuestState } from './guestStorage'

const initialEvents = readGuestState().events

export const useEventStore = defineStore('events', () => {
  const events = ref<HealthEventLog[]>(initialEvents.length ? initialEvents : createDefaultEvents())
  watch(events, (value) => persistGuestField('events', value), { deep: true, immediate: true })

  function addEvent(entry: Omit<HealthEventLog, 'id'>): HealthEventLog {
    const event: HealthEventLog = {
      ...entry,
      id: crypto.randomUUID(),
      notes: DOMPurify.sanitize(entry.notes, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 300),
    }
    events.value.unshift(event)
    return event
  }

  function updateEvent(id: string, update: Omit<HealthEventLog, 'id'>): void {
    const index = events.value.findIndex((event) => event.id === id)
    if (index < 0) return
    events.value[index] = {
      ...update,
      id,
      notes: DOMPurify.sanitize(update.notes, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 300),
    }
  }

  function deleteEvent(id: string): void {
    events.value = events.value.filter((event) => event.id !== id)
  }

  function deleteEventsForDefinition(itemDefinitionId: string): void {
    events.value = events.value.filter((event) => event.itemDefinitionId !== itemDefinitionId)
  }

  function replaceEvents(nextEvents: HealthEventLog[]): void {
    events.value = nextEvents
  }

  function resetState(): void {
    events.value = []
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    deleteEventsForDefinition,
    replaceEvents,
    resetState,
  }
})