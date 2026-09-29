<script setup lang="ts">
import { computed, ref } from 'vue'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import type { EventFilter, HealthEventLog, HealthItemDefinition } from '@cuidat/shared'
import { detectCorrelations } from '@cuidat/shared/correlation'
import type { CalendarProfile } from '@cuidat/shared'
import DashboardHeader from './components/DashboardHeader.vue'
import SidebarDock from './components/dock/SidebarDock.vue'
import CalendarGrid from './components/calendar/CalendarGrid.vue'
import MonthlyInsightsSummary from './components/summary/MonthlyInsightsSummary.vue'
import EventLogModal from './components/modals/EventLogModal.vue'
import { useCalendar } from './composables/useCalendar'
import { useInteraction } from './composables/useInteraction'
import type { CalendarEntry } from './types/calendar'

const profile: CalendarProfile = {
  id: 'profile-luna',
  name: 'Luna',
  type: 'pet',
  avatarIcon: '🐕',
}

const items: HealthItemDefinition[] = [
  { id: 'vomiting', name: 'Vómitos', emoji: '🤢', category: 'symptom', isActive: true },
  { id: 'itching', name: 'Picor', emoji: '🐾', category: 'symptom', isActive: true },
  { id: 'low-energy', name: 'Poca energía', emoji: '🪫', category: 'symptom', isActive: true },
  { id: 'new-food', name: 'Comida nueva', emoji: '🥣', category: 'trigger', isActive: true },
  { id: 'park', name: 'Parque', emoji: '🌳', category: 'trigger', isActive: true },
  { id: 'medication', name: 'Medicación', emoji: '💊', category: 'medication', isActive: true },
]

function createSampleLog(
  itemDefinitionId: string,
  daysAgo: number,
  hour: number,
  intensity: HealthEventLog['intensity'],
  notes: string,
): HealthEventLog {
  return {
    id: crypto.randomUUID(),
    calendarId: profile.id,
    itemDefinitionId,
    loggedAt: dayjs().subtract(daysAgo, 'day').hour(hour).minute(15).second(0).toISOString(),
    intensity,
    notes,
  }
}

const logs = ref<HealthEventLog[]>([
  createSampleLog('new-food', 6, 18, 1, 'Cambio gradual de pienso.'),
  createSampleLog('itching', 5, 9, 2, 'Se rascó después del paseo.'),
  createSampleLog('park', 3, 17, 1, ''),
  createSampleLog('vomiting', 2, 8, 2, 'Una vez por la mañana.'),
  createSampleLog('new-food', 1, 19, 1, ''),
])

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
const modalItem = ref<HealthItemDefinition | null>(null)
const modalDate = ref('')

const monthlyEntries = computed<CalendarEntry[]>(() =>
  logs.value
    .filter((log) => log.calendarId === profile.id && dayjs(log.loggedAt).isSame(activeDate.value, 'month'))
    .flatMap((log) => {
      const item = items.find((candidate) => candidate.id === log.itemDefinitionId)
      return item ? [{ log, item }] : []
    }),
)

const correlatedIds = computed<Set<string>>(() => {
  const triggerLogs = monthlyEntries.value
    .filter(({ item }) => item.category === 'trigger')
    .map(({ log }) => log)
  const symptomLogs = monthlyEntries.value
    .filter(({ item }) => item.category === 'symptom')
    .map(({ log }) => log)
  return new Set(detectCorrelations(triggerLogs, symptomLogs).flatMap(({ triggerEvent, symptomEvent }) => [
    triggerEvent.id,
    symptomEvent.id,
  ]))
})

const calendarEntries = computed<CalendarEntry[]>(() =>
  selectedFilter.value === 'correlations'
    ? monthlyEntries.value.filter(({ log }) => correlatedIds.value.has(log.id))
    : monthlyEntries.value,
)

function openLog(item: HealthItemDefinition, date: string): void {
  modalItem.value = item
  modalDate.value = date
  clearSelection()
}

function selectDay(date: string): void {
  if (selectedItem.value) openLog(selectedItem.value, date)
}

function dropItem(date: string, event: DragEvent): void {
  const itemId = getDraggedItemId(event)
  const item = items.find((candidate) => candidate.id === itemId)
  if (item) openLog(item, date)
}

function saveLog(entry: Omit<HealthEventLog, 'id' | 'calendarId'>): void {
  const cleanNotes = DOMPurify.sanitize(entry.notes, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 300)
  logs.value.unshift({ ...entry, notes: cleanNotes, id: crypto.randomUUID(), calendarId: profile.id })
  modalItem.value = null
}

function showCorrelations(): void {
  selectedFilter.value = 'correlations'
}
</script>

<template>
  <main class="app-shell">
    <DashboardHeader :profile="profile" />

    <div class="workspace-shell">
      <div class="calendar-region">
        <CalendarGrid
          :days="visibleDays"
          :month-label="monthLabel"
          :weekday-labels="weekdayLabels"
          :entries="calendarEntries"
          :filter="selectedFilter"
          :touch-mode="isTouchMode"
          :selected-item="selectedItem"
          @previous-month="goToPreviousMonth"
          @next-month="goToNextMonth"
          @today="goToToday"
          @select-day="selectDay"
          @drop-item="dropItem"
          @filter-change="selectedFilter = $event"
        />
      </div>
      <div class="summary-region">
        <MonthlyInsightsSummary
          :month-label="monthLabel"
          :entries="monthlyEntries"
          @show-correlations="showCorrelations"
        />
      </div>
      <div class="dock-region">
        <SidebarDock
          :items="items"
          :selected-item-id="selectedItem?.id ?? null"
          :touch-mode="isTouchMode"
          @select-item="selectItem"
          @drag-item="startItemDrag"
        />
      </div>
    </div>

    <footer class="app-footer"><span>CuidaT</span> · Un registro claro para conversaciones más informadas.</footer>

    <EventLogModal
      v-if="modalItem"
      :item="modalItem"
      :date="modalDate"
      @close="modalItem = null"
      @save="saveLog"
    />
  </main>
</template>