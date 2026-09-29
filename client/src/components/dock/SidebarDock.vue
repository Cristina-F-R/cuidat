<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HealthItemDefinition, ItemCategory } from '@cuidat/shared'
import DraggableBadge from './DraggableBadge.vue'

const props = defineProps<{
  items: HealthItemDefinition[]
  selectedItemId: string | null
  touchMode: boolean
}>()

const emit = defineEmits<{
  selectItem: [item: HealthItemDefinition]
  dragItem: [item: HealthItemDefinition, event: DragEvent]
}>()

const activeTab = ref<'symptoms' | 'triggers'>('symptoms')
const visibleItems = computed<HealthItemDefinition[]>(() =>
  props.items.filter((item) => {
    const belongsToTab = activeTab.value === 'symptoms'
      ? item.category === 'symptom'
      : item.category !== 'symptom'
    return item.isActive && belongsToTab
  }),
)

function categoryLabel(category: ItemCategory): string {
  return category === 'symptom' ? 'Síntomas' : 'Desencadenantes'
}

function forwardDrag(item: HealthItemDefinition, event: DragEvent): void {
  emit('dragItem', item, event)
}
</script>

<template>
  <aside class="dock-panel" aria-label="Biblioteca de registros">
    <header class="panel-heading">
      <div>
        <p class="eyebrow">BIBLIOTECA</p>
        <h2>Registra algo</h2>
      </div>
      <span class="item-count">{{ visibleItems.length }}</span>
    </header>

    <div class="dock-tabs" role="tablist" aria-label="Tipo de registro">
      <button :aria-selected="activeTab === 'symptoms'" role="tab" @click="activeTab = 'symptoms'">Síntomas</button>
      <button :aria-selected="activeTab === 'triggers'" role="tab" @click="activeTab = 'triggers'">Desencadenantes</button>
    </div>

    <p class="dock-instruction">
      {{ touchMode ? 'Elige un elemento y toca un día' : 'Arrastra un elemento hasta un día' }}
    </p>

    <div class="dock-items">
      <DraggableBadge
        v-for="item in visibleItems"
        :key="item.id"
        :item="item"
        :is-selected="item.id === selectedItemId"
        :touch-mode="touchMode"
        @select="emit('selectItem', $event)"
        @drag-start="forwardDrag"
      />
    </div>

    <footer class="dock-footer">
      <span class="category-mark" :class="activeTab" />
      <span>{{ categoryLabel(activeTab === 'symptoms' ? 'symptom' : 'trigger') }}</span>
    </footer>
  </aside>
</template>

<style scoped>
.dock-panel { min-width: 0; padding: 20px 16px 14px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.76); }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.panel-heading h2 { margin: 4px 0 0; font-size: 18px; font-weight: 900; }
.eyebrow { margin: 0; color: var(--muted); font-size: 10px; font-weight: 900; letter-spacing: 1px; }
.item-count { display: grid; place-items: center; min-width: 26px; height: 26px; border-radius: 50%; background: var(--tint); font-size: 12px; font-weight: 800; }
.dock-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-top: 20px; padding: 3px; border-radius: 8px; background: var(--tint); }
.dock-tabs button { min-height: 34px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); font-size: 11px; font-weight: 800; cursor: pointer; }
.dock-tabs button[aria-selected="true"] { background: white; color: var(--ink); box-shadow: 0 1px 3px #233c5018; }
.dock-instruction { margin: 14px 4px 8px; color: var(--muted); font-size: 11px; }
.dock-items { display: grid; gap: 4px; }
.dock-footer { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 12px 4px 0; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; font-weight: 700; }
.category-mark { width: 8px; height: 8px; border-radius: 50%; background: var(--peach); }
.category-mark.triggers { background: var(--mint-strong); }
@media (max-width: 899px) { .dock-panel { padding: 16px; } .dock-items { display: flex; overflow-x: auto; padding: 2px 0 8px; } .dock-footer { display: none; } }
</style>