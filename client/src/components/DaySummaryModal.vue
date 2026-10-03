<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { CalendarEntry } from '../types/calendar'

const props = defineProps<{
  date: string
  entries: CalendarEntry[]
}>()

const emit = defineEmits<{
  close: []
}>()

const dateLabel = computed(() => dayjs(props.date).locale('es').format('dddd, D [de] MMMM'))
const dayEntries = computed(() => props.entries
  .filter(({ log }) => dayjs(log.loggedAt).format('YYYY-MM-DD') === props.date)
  .slice()
  .sort((left, right) => Date.parse(left.log.loggedAt) - Date.parse(right.log.loggedAt)))

function formatTime(loggedAt: string): string {
  return dayjs(loggedAt).format('HH:mm')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="day-summary" role="dialog" aria-modal="true" aria-labelledby="day-summary-title">
      <header>
        <div><p>RESUMEN DEL DÍA</p><h2 id="day-summary-title">{{ dateLabel }}</h2></div>
        <button aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button>
      </header>
      <ol v-if="dayEntries.length" class="event-list">
        <li v-for="entry in dayEntries" :key="entry.log.id" class="event-row">
          <time>{{ formatTime(entry.log.loggedAt) }}</time>
          <div class="event-details">
            <span class="item-badge" :class="entry.item.category"><span aria-hidden="true">{{ entry.item.emoji }}</span>{{ entry.item.name }}</span>
            <span class="intensity" :class="`intensity-${entry.log.intensity}`">Intensidad {{ entry.log.intensity }}</span>
            <p v-if="entry.log.notes" class="event-notes">{{ entry.log.notes }}</p>
          </div>
        </li>
      </ol>
      <p v-else class="empty-day">No hay registros para este día.</p>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--overlay); }
.day-summary { width: min(100%, 520px); max-height: min(80vh, 640px); overflow: auto; padding: 21px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 20px 60px var(--shadow-soft); }
header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 15px; border-bottom: 1px solid var(--line); }
header p { margin: 0 0 3px; color: var(--muted); font-size: 9px; font-weight: 900; }
h2 { margin: 0; color: var(--slate); font-size: 19px; text-transform: capitalize; }
header button { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--slate); cursor: pointer; }
.event-list { display: grid; gap: 0; margin: 0; padding: 5px 0 0; list-style: none; }
.event-row { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line); }
.event-row time { padding-top: 3px; color: var(--slate); font-size: 12px; font-weight: 900; }
.event-details { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.item-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 7px; border-radius: 5px; color: var(--slate); font-size: 11px; font-weight: 800; }
.item-badge.symptom { background: var(--peach); }
.item-badge.trigger { background: var(--mint); }
.item-badge.medication { background: var(--sky); }
.intensity { padding: 4px 7px; border-radius: 5px; color: var(--slate); font-size: 10px; font-weight: 800; }
.intensity-1 { background: var(--mint); }
.intensity-2 { background: var(--peach); }
.intensity-3 { @apply bg-red-600 text-white; }
.event-notes { flex: 1 0 100%; margin: 0; color: var(--muted); font-size: 11px; line-height: 1.45; overflow-wrap: anywhere; }
.empty-day { margin: 20px 0 4px; color: var(--muted); font-size: 12px; }
</style>