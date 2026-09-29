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
    :class="{ 'dock-item-selected': isSelected }"
    :draggable="!touchMode"
    :aria-pressed="isSelected"
    :aria-label="`${item.name}, ${item.category === 'symptom' ? 'síntoma' : 'desencadenante'}`"
    @click="emit('select', item)"
    @dragstart="emit('dragStart', item, $event)"
  >
    <span class="dock-item-emoji" aria-hidden="true">{{ item.emoji }}</span>
    <span class="dock-item-name">{{ item.name }}</span>
    <span class="dock-item-grip" aria-hidden="true">⠿</span>
  </button>
</template>

<style scoped>
.dock-item { display: grid; grid-template-columns: 36px minmax(0, 1fr) 14px; align-items: center; gap: 10px; width: 100%; min-height: 54px; padding: 7px 10px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }
.dock-item:hover { background: var(--surface); }
.dock-item-selected { border-color: var(--slate); background: var(--surface); box-shadow: inset 3px 0 var(--slate); }
.dock-item-emoji { display: grid; place-items: center; width: 36px; aspect-ratio: 1; border-radius: 8px; background: var(--item-tint, var(--peach)); font-size: 19px; }
.dock-item-name { overflow: hidden; font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.dock-item-grip { color: var(--muted); font-size: 16px; }
@media (max-width: 899px) { .dock-item { width: 160px; flex: 0 0 160px; } }
</style>