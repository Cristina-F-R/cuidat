import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import type { EventFilter, HealthEventLog, HealthItemDefinition } from '@cuidat/shared'
import { detectCorrelations } from '@cuidat/shared/correlation'
import { useCalendar } from './useCalendar'
import { useInteraction } from './useInteraction'
import { createDemoEvents, DEMO_ITEMS, DEMO_PROFILE, DEFAULT_PROFILE } from '../stores/defaults'
import { useAuthStore } from '../stores/useAuthStore'
import { useEventStore } from '../stores/useEventStore'
import { useItemDefinitionStore } from '../stores/useItemDefinitionStore'
import { useProfileStore } from '../stores/useProfileStore'
import type { CalendarEntry } from '../types/calendar'

export function useDashboard() {
  const profileStore = useProfileStore()
  const eventStore = useEventStore()
  const itemDefinitionStore = useItemDefinitionStore()
  const authStore = useAuthStore()
  const { events } = storeToRefs(eventStore)
  const { itemDefinitions } = storeToRefs(itemDefinitionStore)
  const profile = computed(() => profileStore.activeProfile ?? DEFAULT_PROFILE)
  const profiles = computed(() => profileStore.profiles)
  const items = computed(() => itemDefinitions.value.filter((item) => item.calendarId === profile.value.id))

  const {
    activeDate,
    monthLabel,
    weekdayLabels,
    visibleDays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useCalendar()
  const { isTouchMode, selectedItem, selectItem, clearSelection, startItemDrag, getDraggedItemId } = useInteraction(items)
  const selectedFilter = ref<EventFilter>('all')
  const consultationMode = ref(false)
  const modalItem = ref<HealthItemDefinition | null>(null)
  const modalDate = ref('')
  const modalLog = ref<HealthEventLog | null>(null)
  const daySummaryDate = ref<string | null>(null)
  const pendingCascade = ref<{ item: HealthItemDefinition; eventCount: number } | null>(null)

  const profileEntries = computed<CalendarEntry[]>(() =>
    events.value
      .filter((log) => log.calendarId === profile.value.id)
      .flatMap((log) => {
        const item = items.value.find((candidate) => candidate.id === log.itemDefinitionId)
        return item ? [{ log, item }] : []
      }),
  )

  const monthlyEntries = computed<CalendarEntry[]>(() =>
    profileEntries.value.filter(({ log }) => dayjs(log.loggedAt).isSame(activeDate.value, 'month')),
  )

  const correlatedIds = computed<Set<string>>(() => {
    const triggerLogs = profileEntries.value.filter(({ item }) => item.category === 'trigger').map(({ log }) => log)
    const symptomLogs = profileEntries.value.filter(({ item }) => item.category === 'symptom').map(({ log }) => log)
    return new Set(detectCorrelations(triggerLogs, symptomLogs).flatMap(({ triggerEvent, symptomEvent }) => [
      triggerEvent.id,
      symptomEvent.id,
    ]))
  })

  const calendarEntries = computed<CalendarEntry[]>(() => {
    const entries = selectedFilter.value === 'correlations'
      ? monthlyEntries.value.filter(({ log }) => correlatedIds.value.has(log.id))
      : monthlyEntries.value
    if (selectedFilter.value === 'symptoms') return entries.filter(({ item }) => item.category === 'symptom')
    if (selectedFilter.value === 'triggers') return entries.filter(({ item }) => item.category !== 'symptom')
    return entries
  })

  function openLog(item: HealthItemDefinition, date: string): void {
    daySummaryDate.value = null
    modalItem.value = item
    modalDate.value = date
    modalLog.value = null
    clearSelection()
  }

  function openExistingLog(entry: CalendarEntry): void {
    modalItem.value = entry.item
    modalDate.value = dayjs(entry.log.loggedAt).format('YYYY-MM-DD')
    modalLog.value = entry.log
  }

  function closeLog(): void {
    modalItem.value = null
    modalLog.value = null
  }

  function closeDaySummary(): void {
    daySummaryDate.value = null
  }

  function selectDay(date: string): void {
    if (!consultationMode.value && selectedItem.value) {
      openLog(selectedItem.value, date)
      return
    }
    daySummaryDate.value = date
  }

  function dropItem(date: string, event: DragEvent): void {
    if (consultationMode.value) return
    const itemId = getDraggedItemId(event)
    const item = items.value.find((candidate) => candidate.id === itemId && candidate.isActive)
    if (item) openLog(item, date)
  }

  function saveLog(entry: HealthEventLog | Omit<HealthEventLog, 'id' | 'calendarId'>): void {
    if ('id' in entry) {
      const { id, ...update } = entry
      eventStore.updateEvent(id, update)
    } else {
      eventStore.addEvent({ ...entry, calendarId: profile.value.id })
    }
    closeLog()
  }

  function deleteLog(id: string): void {
    eventStore.deleteEvent(id)
    closeLog()
  }

  function addItem(item: HealthItemDefinition): void {
    itemDefinitionStore.addDefinition(item, profile.value.id)
  }

  function updateItem(item: HealthItemDefinition): void {
    itemDefinitionStore.updateDefinition(item)
  }

  function requestDeleteItem(item: HealthItemDefinition): void {
    const linkedEvents = events.value.filter((event) => event.itemDefinitionId === item.id)
    if (linkedEvents.length > 0) {
      pendingCascade.value = { item, eventCount: linkedEvents.length }
      return
    }
    deleteItemDefinition(item)
  }

  function deleteItemDefinition(item: HealthItemDefinition): void {
    eventStore.deleteEventsForDefinition(item.id)
    itemDefinitionStore.deleteDefinition(item.id)
  }

  function cancelCascadeDelete(): void {
    pendingCascade.value = null
  }

  function confirmCascadeDelete(): void {
    const cascade = pendingCascade.value
    if (!cascade) return
    deleteItemDefinition(cascade.item)
    pendingCascade.value = null
  }

  function enterDemo(): void {
    profileStore.replaceProfiles([DEMO_PROFILE], DEMO_PROFILE.id)
    itemDefinitionStore.replaceDefinitions(DEMO_ITEMS)
    eventStore.replaceEvents(createDemoEvents())
    authStore.enterDemo()
    selectedFilter.value = 'correlations'
    consultationMode.value = false
    clearSelection()
    closeLog()
  }

  function setConsultationMode(enabled: boolean): void {
    consultationMode.value = enabled
    clearSelection()
    if (enabled) closeLog()
  }

  function showCorrelations(): void {
    selectedFilter.value = 'correlations'
  }

  function selectProfile(nextProfile: typeof DEFAULT_PROFILE): void {
    profileStore.setActiveProfile(nextProfile)
    selectedFilter.value = 'all'
    closeLog()
    closeDaySummary()
  }

  function createProfile(newProfile: typeof DEFAULT_PROFILE): void {
    profileStore.addProfile(newProfile)
    selectedFilter.value = 'all'
    closeLog()
    closeDaySummary()
  }

  return {
    profile,
    profiles,
    items,
    profileEntries,
    monthLabel,
    weekdayLabels,
    visibleDays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    isTouchMode,
    selectedItem,
    selectItem,
    startItemDrag,
    selectedFilter,
    consultationMode,
    modalItem,
    modalDate,
    modalLog,
    daySummaryDate,
    pendingCascade,
    monthlyEntries,
    calendarEntries,
    openExistingLog,
    closeLog,
    closeDaySummary,
    selectDay,
    dropItem,
    saveLog,
    deleteLog,
    addItem,
    updateItem,
    requestDeleteItem,
    cancelCascadeDelete,
    confirmCascadeDelete,
    enterDemo,
    setConsultationMode,
    showCorrelations,
    selectProfile,
    createProfile,
  }
}