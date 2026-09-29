<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-vue-next'
import type { CalendarDay, EventFilter, HealthItemDefinition } from '@cuidat/shared'
import type { CalendarEntry } from '../../types/calendar'
import CalendarDayCell from './CalendarDayCell.vue'

const props = defineProps<{
  days: CalendarDay[]
  monthLabel: string
  weekdayLabels: string[]
  entries: CalendarEntry[]
  filter: EventFilter
  touchMode: boolean
  selectedItem: HealthItemDefinition | null
}>()

const emit = defineEmits<{
  previousMonth: []
  nextMonth: []
  today: []
  selectDay: [date: string]
  dropItem: [date: string, event: DragEvent]
  filterChange: [filter: EventFilter]
}>()

const filters: Array<{ value: EventFilter; label: string }> = [
  { value: 'all', label: 'Todo' },
  { value: 'symptoms', label: 'Síntomas' },
  { value: 'triggers', label: 'Desencadenantes' },
  { value: 'correlations', label: 'Coincidencias' },
]

const visibleEntries = computed<CalendarEntry[]>(() => {
  if (props.filter === 'symptoms') return props.entries.filter(({ item }) => item.category === 'symptom')
  if (props.filter === 'triggers') return props.entries.filter(({ item }) => item.category !== 'symptom')
  return props.entries
})

function entriesForDay(date: string): CalendarEntry[] {
  return visibleEntries.value.filter(({ log }) => dayjs(log.loggedAt).format('YYYY-MM-DD') === date)
}

function forwardDrop(date: string, event: DragEvent): void {
  emit('dropItem', date, event)
}
</script>

<template>
  <section class="calendar-panel" aria-label="Calendario mensual">
    <header class="calendar-header">
      <div class="calendar-title-group">
        <div class="calendar-icon"><CalendarDays :size="19" aria-hidden="true" /></div>
        <div>
          <p class="eyebrow">CALENDARIO DE SALUD</p>
          <h1>{{ monthLabel }}</h1>
        </div>
      </div>
      <div class="month-controls">
        <button class="today-button" aria-label="Ir a hoy" @click="emit('today')">Hoy</button>
        <button class="icon-button" aria-label="Mes anterior" @click="emit('previousMonth')"><ChevronLeft :size="18" /></button>
        <button class="icon-button" aria-label="Mes siguiente" @click="emit('nextMonth')"><ChevronRight :size="18" /></button>
      </div>
    </header>

    <div class="calendar-toolbar">
      <div class="filter-tabs" aria-label="Filtrar registros">
        <button
          v-for="option in filters"
          :key="option.value"
          :aria-pressed="filter === option.value"
          @click="emit('filterChange', option.value)"
        >{{ option.label }}</button>
      </div>
      <p v-if="selectedItem" class="selected-hint">{{ selectedItem.emoji }} {{ selectedItem.name }} <span>· toca un día</span></p>
      <p v-else-if="touchMode" class="selected-hint">Selecciona un elemento del dock</p>
    </div>

    <div class="calendar-grid" role="grid" :aria-label="monthLabel">
      <div v-for="weekday in weekdayLabels" :key="weekday" class="weekday" role="columnheader">{{ weekday }}</div>
      <CalendarDayCell
        v-for="day in days"
        :key="day.date"
        :day="day"
        :entries="entriesForDay(day.date)"
        @select-day="emit('selectDay', $event)"
        @drop-item="forwardDrop"
      />
    </div>
    <footer class="calendar-footnote"><span class="today-key" /> Hoy <span class="footnote-divider">·</span> Los registros reflejan lo observado</footer>
  </section>
</template>

<style scoped>
.calendar-panel { min-width: 0; padding: 22px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.78); }
.calendar-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.calendar-title-group { display: flex; align-items: center; gap: 12px; min-width: 0; }
.calendar-icon { display: grid; place-items: center; width: 40px; height: 40px; flex: 0 0 40px; border-radius: 10px; background: var(--tint); color: var(--slate); }
.eyebrow { margin: 0; color: var(--muted); font-size: 10px; font-weight: 900; letter-spacing: 1px; }
h1 { margin: 3px 0 0; color: var(--ink); font-size: 22px; font-weight: 900; line-height: 1.2; }
.month-controls { display: flex; align-items: center; gap: 6px; }
.month-controls button { height: 34px; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--ink); cursor: pointer; }
.today-button { padding: 0 11px; font-size: 12px; font-weight: 800; }
.icon-button { display: grid; place-items: center; width: 34px; padding: 0; }
.calendar-toolbar { display: flex; min-height: 50px; align-items: center; justify-content: space-between; gap: 10px; margin-top: 17px; }
.filter-tabs { display: flex; gap: 3px; overflow-x: auto; }
.filter-tabs button { flex: 0 0 auto; min-height: 32px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); font-size: 11px; font-weight: 800; cursor: pointer; }
.filter-tabs button[aria-pressed="true"] { background: var(--tint); color: var(--ink); }
.selected-hint { overflow: hidden; margin: 0; color: var(--slate); font-size: 11px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.selected-hint span { color: var(--muted); font-weight: 600; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); overflow: hidden; border: 1px solid var(--line); border-radius: 7px; }
.weekday { display: grid; min-width: 0; height: 34px; place-items: center; border-bottom: 1px solid var(--line); background: #f4f8fa; color: var(--muted); font-size: 9px; font-weight: 900; }
.weekday:not(:nth-child(7n)) { border-right: 1px solid var(--line); }
.calendar-grid :deep(.day-cell) { border-top: 0; border-left: 0; }
.calendar-grid :deep(.day-cell:nth-child(7n)) { border-right: 0; }
.calendar-grid :deep(.day-cell:nth-child(n + 8)) { border-top: 1px solid var(--line); }
.calendar-footnote { display: flex; align-items: center; gap: 7px; margin-top: 13px; color: var(--muted); font-size: 10px; }
.today-key { width: 8px; height: 8px; border-radius: 50%; background: var(--slate); }
.footnote-divider { color: var(--peach); font-weight: 900; }
@media (max-width: 600px) { .calendar-panel { padding: 13px 9px; } .calendar-icon { display: none; } h1 { font-size: 19px; } .calendar-header { gap: 5px; } .calendar-toolbar { flex-direction: column; align-items: flex-start; padding: 7px 0; } .calendar-grid :deep(.day-cell) { min-height: 62px; } }
</style>