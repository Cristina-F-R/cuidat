<script setup lang="ts">
import type { EventFilter, HealthItemDefinition } from '@cuidat/shared'

const props = defineProps<{
  filter: EventFilter
  touchMode: boolean
  selectedItem: HealthItemDefinition | null
  consultationMode: boolean
}>()

const emit = defineEmits<{
  filterChange: [filter: EventFilter]
  consultationModeChange: [enabled: boolean]
}>()

const filters: Array<{ value: EventFilter; label: string }> = [
  { value: 'all', label: 'Todo' },
  { value: 'symptoms', label: 'Síntomas' },
  { value: 'triggers', label: 'Desencadenantes' },
  { value: 'correlations', label: 'Coincidencias' },
]
</script>

<template>
  <div class="calendar-toolbar">
    <div class="toolbar-controls">
      <div class="filter-tabs" aria-label="Filtrar registros">
        <button
          v-for="option in filters"
          :key="option.value"
          :aria-pressed="filter === option.value"
          @click="emit('filterChange', option.value)"
        >{{ option.label }}</button>
      </div>
      <label class="consultation-toggle">
        <input
          type="checkbox"
          :checked="consultationMode"
          @change="emit('consultationModeChange', ($event.target as HTMLInputElement).checked)"
        />
        <span>Modo Consulta</span>
      </label>
    </div>
    <p v-if="selectedItem && !consultationMode" class="selected-hint">{{ selectedItem.emoji }} {{ selectedItem.name }} <span>· toca un día</span></p>
    <p v-else-if="touchMode && !consultationMode" class="selected-hint">Selecciona un elemento del dock</p>
    <p v-else-if="consultationMode" class="consultation-note">Vista de revisión clínica</p>
  </div>
</template>

<style scoped>
.calendar-toolbar { display: grid; min-height: 50px; gap: 7px; margin-top: 17px; }
.toolbar-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
.filter-tabs { display: flex; gap: 3px; overflow-x: auto; }
.filter-tabs button { flex: 0 0 auto; min-height: 32px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); font-size: 11px; font-weight: 800; cursor: pointer; }
.filter-tabs button[aria-pressed="true"] { background: var(--tint); color: var(--ink); }
.consultation-toggle { display: flex; flex: 0 0 auto; align-items: center; gap: 7px; color: var(--slate); font-size: 11px; font-weight: 800; cursor: pointer; }
.consultation-toggle input { width: 16px; height: 16px; accent-color: var(--slate); }
.selected-hint, .consultation-note { margin: 0; color: var(--slate); font-size: 11px; font-weight: 800; }
.selected-hint span { color: var(--muted); font-weight: 600; }
.consultation-note { color: var(--muted); }
@media (max-width: 600px) { .toolbar-controls { align-items: flex-start; flex-direction: column; } .calendar-toolbar { padding: 7px 0; } }
</style>