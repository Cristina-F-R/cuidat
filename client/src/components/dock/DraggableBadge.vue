<script setup lang="ts">
import type { HealthItemDefinition } from '@cuidat/shared'

defineProps<{
  item: HealthItemDefinition
  isSelected: boolean
  touchMode: boolean
}>()

const emit = defineEmits<{
  select: [item: HealthItemDefinition]
  dragStart: [item: HealthItemDefinition, event: DragEvent]
}>()
</script>

<template>
  <button
    class="dock-item"
    :class="[item.category, { 'dock-item-selected': isSelected }]"
    :draggable="!touchMode"
    :aria-pressed="isSelected"
    :aria-label="`${item.name}, ${item.category === 'symptom' ? 'síntoma' : item.category === 'trigger' ? 'desencadenante' : 'medicación'}`"
    @click="emit('select', item)"
    @dragstart="emit('dragStart', item, $event)"
  >
    <span class="dock-item-emoji" aria-hidden="true">{{ item.emoji }}</span>
    <span class="dock-item-name">{{ item.name }}</span>
  </button>
</template>

<style scoped>
.dock-item { display: grid; grid-template-columns: 36px minmax(0, 1fr); align-items: center; gap: 9px; width: 100%; min-width: 0; min-height: 54px; padding: 7px 9px; border: 0; border-radius: 0; background: transparent; color: var(--slate); text-align: left; cursor: pointer; }
.dock-item:hover { filter: brightness(.97); }
.dock-item-emoji { display: grid; place-items: center; width: 36px; aspect-ratio: 1; border-radius: 8px; background: white; color: var(--slate); font-size: 19px; }
.dock-item-name { overflow: hidden; font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 899px) { .dock-item { width: 100%; flex: 0 0 auto; } }
</style>