import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import DOMPurify from 'dompurify'
import type { HealthItemDefinition, ItemCategory } from '@cuidat/shared'
import { DEFAULT_ITEMS, DEFAULT_PROFILE } from './defaults'
import { persistGuestField, readGuestState } from './guestStorage'

export const MAX_ACTIVE_ITEMS_PER_CATEGORY = 15
const initialGuestState = readGuestState()
const initialCalendarId = initialGuestState.activeProfileId ?? DEFAULT_PROFILE.id
const initialItems = initialGuestState.itemDefinitions.map((item) => ({
  ...item,
  calendarId: item.calendarId ?? initialCalendarId,
}))

export const useItemDefinitionStore = defineStore('itemDefinitions', () => {
  const itemDefinitions = ref<HealthItemDefinition[]>(initialItems.length ? initialItems : DEFAULT_ITEMS)
  const activeItems = computed<HealthItemDefinition[]>(() =>
    itemDefinitions.value.filter((item) => item.isActive),
  )

  watch(itemDefinitions, (value) => persistGuestField('itemDefinitions', value), { deep: true, immediate: true })

  function addDefinition(definition: HealthItemDefinition, calendarId: string): boolean {
    const activeInCategory = itemDefinitions.value.filter(
      (item) => item.isActive && item.category === definition.category && item.calendarId === calendarId,
    ).length
    if (activeInCategory >= MAX_ACTIVE_ITEMS_PER_CATEGORY) return false
    const name = DOMPurify.sanitize(definition.name.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 100)
    const emoji = DOMPurify.sanitize(definition.emoji, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 10)
    if (!name || !emoji) return false
    itemDefinitions.value.push({
      ...definition,
      calendarId,
      name,
      emoji,
    })
    return true
  }

  function updateDefinition(definition: HealthItemDefinition): boolean {
    const index = itemDefinitions.value.findIndex((item) => item.id === definition.id)
    if (index < 0) return false

    const current = itemDefinitions.value[index]
    const activeInCategory = itemDefinitions.value.filter(
      (item) => item.id !== definition.id
        && item.isActive
        && item.calendarId === current.calendarId
        && item.category === definition.category,
    ).length
    if (definition.isActive && activeInCategory >= MAX_ACTIVE_ITEMS_PER_CATEGORY) return false

    const name = DOMPurify.sanitize(definition.name.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 100)
    const emoji = DOMPurify.sanitize(definition.emoji, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 10)
    if (!name || !emoji) return false

    itemDefinitions.value[index] = {
      ...current,
      name,
      emoji,
      category: definition.category,
      isActive: definition.isActive,
    }
    return true
  }

  function deleteDefinition(id: string): void {
    itemDefinitions.value = itemDefinitions.value.filter((item) => item.id !== id)
  }

  function activeCount(category: ItemCategory, calendarId?: string): number {
    return itemDefinitions.value.filter((item) =>
      item.isActive && item.category === category && (!calendarId || item.calendarId === calendarId),
    ).length
  }

  function replaceDefinitions(definitions: HealthItemDefinition[]): void {
    itemDefinitions.value = definitions
  }

  return { itemDefinitions, activeItems, addDefinition, updateDefinition, deleteDefinition, activeCount, replaceDefinitions }
})