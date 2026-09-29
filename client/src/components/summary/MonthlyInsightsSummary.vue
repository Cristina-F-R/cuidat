<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Sparkles } from 'lucide-vue-next'
import type { HealthItemDefinition } from '@cuidat/shared'
import type { CalendarEntry } from '../../types/calendar'

const props = defineProps<{
  monthLabel: string
  entries: CalendarEntry[]
}>()

const emit = defineEmits<{
  showCorrelations: []
}>()

const symptomCount = computed<number>(() =>
  props.entries.filter(({ item }) => item.category === 'symptom').length,
)
const triggerCount = computed<number>(() =>
  props.entries.filter(({ item }) => item.category === 'trigger').length,
)
const activeDays = computed<number>(() =>
  new Set(props.entries.map(({ log }) => log.loggedAt.slice(0, 10))).size,
)
const leadingTrigger = computed<HealthItemDefinition | null>(() => {
  const counts = new Map<string, { item: HealthItemDefinition; count: number }>()
  for (const { item } of props.entries) {
    if (item.category !== 'trigger') continue
    const current = counts.get(item.id)
    counts.set(item.id, { item, count: (current?.count ?? 0) + 1 })
  }
  return [...counts.values()].sort((left, right) => right.count - left.count)[0]?.item ?? null
})
</script>

<template>
  <aside class="insights-panel" aria-label="Resumen mensual">
    <header class="insights-heading">
      <div>
        <p class="eyebrow">VISTA DEL MES</p>
        <h2>Resumen</h2>
      </div>
      <span class="insights-icon"><Activity :size="18" aria-hidden="true" /></span>
    </header>
    <p class="summary-month">{{ monthLabel }}</p>

    <div class="metric-grid">
      <div class="metric symptom-metric">
        <span class="metric-number">{{ symptomCount }}</span>
        <span class="metric-label">síntomas</span>
      </div>
      <div class="metric trigger-metric">
        <span class="metric-number">{{ triggerCount }}</span>
        <span class="metric-label">desencadenantes</span>
      </div>
      <div class="metric days-metric">
        <span class="metric-number">{{ activeDays }}</span>
        <span class="metric-label">días con registro</span>
      </div>
    </div>

    <section class="pattern-section">
      <p class="eyebrow"><Sparkles :size="13" aria-hidden="true" /> PATRÓN A EXPLORAR</p>
      <div v-if="leadingTrigger" class="pattern-note">
        <span class="pattern-emoji">{{ leadingTrigger.emoji }}</span>
        <div><strong>{{ leadingTrigger.name }}</strong><p>Es el desencadenante más anotado este mes.</p></div>
      </div>
      <p v-else class="empty-pattern">Aún no hay suficientes registros para mostrar coincidencias.</p>
      <button class="correlation-link" @click="emit('showCorrelations')">Ver coincidencias <span aria-hidden="true">→</span></button>
    </section>

    <p class="medical-disclaimer">Coincidencias, no diagnósticos. Consulta con un profesional.</p>
  </aside>
</template>

<style scoped>
.insights-panel { min-width: 0; padding: 20px 17px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.76); }
.insights-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.eyebrow { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--muted); font-size: 9px; font-weight: 900; letter-spacing: .8px; }
h2 { margin: 4px 0 0; font-size: 19px; font-weight: 900; }
.insights-icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 9px; background: var(--mint); color: var(--slate); }
.summary-month { margin: 22px 0 9px; color: var(--muted); font-size: 11px; font-weight: 700; }
.metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.metric { display: grid; min-height: 74px; align-content: center; gap: 3px; padding: 10px; border-radius: 8px; }
.symptom-metric { background: #fff1e5; }
.trigger-metric { background: var(--mint); }
.days-metric { grid-column: 1 / -1; background: var(--tint); }
.metric-number { font-size: 22px; font-weight: 900; line-height: 1; }
.metric-label { color: #536b7d; font-size: 10px; font-weight: 700; }
.pattern-section { margin-top: 23px; padding-top: 18px; border-top: 1px solid var(--line); }
.pattern-note { display: flex; align-items: flex-start; gap: 10px; margin-top: 13px; }
.pattern-emoji { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border-radius: 8px; background: var(--mint); font-size: 17px; }
.pattern-note strong { font-size: 12px; }
.pattern-note p, .empty-pattern { margin: 3px 0 0; color: var(--muted); font-size: 11px; line-height: 1.45; }
.correlation-link { display: flex; width: 100%; justify-content: space-between; margin-top: 15px; padding: 10px 0 0; border: 0; border-top: 1px solid var(--line); background: transparent; color: var(--slate); font-size: 11px; font-weight: 900; cursor: pointer; }
.medical-disclaimer { margin: 18px 0 0; padding: 10px; border-left: 3px solid var(--peach); background: #fff8f1; color: #64584e; font-size: 10px; line-height: 1.5; }
</style>