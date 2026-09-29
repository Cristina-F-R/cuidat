<script setup lang="ts">
import type { CalendarDay } from '@cuidat/shared'
import type { CalendarEntry } from '../../types/calendar'

defineProps<{
  day: CalendarDay
  entries: CalendarEntry[]
}>()

const emit = defineEmits<{
  selectDay: [date: string]
  dropItem: [date: string, event: DragEvent]
}>()
</script>

<template>
  <article
    class="day-cell"
    :class="{ 'day-outside': !day.isCurrentMonth, 'day-today': day.isToday }"
    :aria-label="day.date"
    role="button"
    tabindex="0"
    @click="emit('selectDay', day.date)"
    @keydown.enter.prevent="emit('selectDay', day.date)"
    @keydown.space.prevent="emit('selectDay', day.date)"
    @dragover.prevent
    @drop.prevent.stop="emit('dropItem', day.date, $event)"
  >
    <span class="day-number">{{ day.dayOfMonth }}</span>
    <div class="day-events" :aria-label="`${entries.length} registros`">
      <span
        v-for="entry in entries.slice(0, 3)"
        :key="entry.log.id"
        class="day-event"
        :class="entry.item.category"
        :title="entry.item.name"
      >
        <span aria-hidden="true">{{ entry.item.emoji }}</span>
        <span class="day-event-name">{{ entry.item.name }}</span>
      </span>
      <span v-if="entries.length > 3" class="event-overflow">+{{ entries.length - 3 }}</span>
    </div>
  </article>
</template>

<style scoped>
.day-cell { display: flex; min-width: 0; min-height: 88px; flex-direction: column; gap: 8px; padding: 9px 7px; border: 1px solid var(--line); background: var(--canvas); text-align: left; cursor: pointer; transition: background .16s ease, border-color .16s ease; }
.day-cell:hover, .day-cell:focus-visible { z-index: 1; border-color: var(--slate); outline: none; background: white; }
.day-outside { background: #f5f8fa; color: #9aa9b5; }
.day-today .day-number { display: grid; place-items: center; width: 26px; height: 26px; margin: -4px 0 0 -4px; border-radius: 50%; background: var(--slate); color: white; }
.day-number { align-self: flex-start; font-size: 12px; font-weight: 900; }
.day-events { display: grid; gap: 3px; overflow: hidden; }
.day-event { display: flex; min-width: 0; align-items: center; gap: 4px; overflow: hidden; border-radius: 4px; padding: 2px 4px; font-size: 10px; line-height: 1.3; }
.day-event.symptom { background: #fff0e3; }
.day-event.trigger { background: var(--mint); }
.day-event.medication { background: var(--sky); }
.day-event-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-overflow { color: var(--muted); font-size: 10px; font-weight: 800; }
@media (max-width: 600px) { .day-cell { min-height: 64px; padding: 6px 3px; } .day-event { justify-content: center; padding: 2px; } .day-event-name { display: none; } }
</style>