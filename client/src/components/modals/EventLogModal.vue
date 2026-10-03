<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, X } from 'lucide-vue-next'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { HealthEventLog, HealthItemDefinition } from '@cuidat/shared'

const props = defineProps<{
  item: HealthItemDefinition
  date: string
  log?: HealthEventLog | null
}>()

const emit = defineEmits<{
  close: []
  save: [entry: HealthEventLog | Omit<HealthEventLog, 'id' | 'calendarId'>]
  delete: [id: string]
}>()

const time = ref(props.log ? dayjs(props.log.loggedAt).format('HH:mm') : dayjs().format('HH:mm'))
const intensity = ref<HealthEventLog['intensity']>(props.log?.intensity ?? 2)
const notes = ref(props.log?.notes ?? '')
const dateLabel = dayjs(props.date).locale('es').format('dddd, D [de] MMMM')

function submitLog(): void {
  emit('save', {
    itemDefinitionId: props.item.id,
    ...(props.log ? { id: props.log.id, calendarId: props.log.calendarId } : {}),
    loggedAt: new Date(`${props.date}T${time.value}`).toISOString(),
    intensity: intensity.value,
    notes: notes.value,
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="event-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal-heading">
        <div class="modal-item-icon" :class="item.category">{{ item.emoji }}</div>
        <div class="modal-title-copy"><p class="eyebrow">{{ log ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO' }} · {{ dateLabel }}</p><h2 id="modal-title">{{ item.name }}</h2></div>
        <button class="icon-button" aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button>
      </header>

      <form class="event-form" @submit.prevent="submitLog">
        <label class="field-label" for="event-time">Hora aproximada</label>
        <input id="event-time" v-model="time" class="form-control" type="time" required />

        <label class="field-label" for="event-intensity">Intensidad</label>
        <select id="event-intensity" v-model="intensity" class="form-control">
          <option :value="1">1 · Leve</option>
          <option :value="2">2 · Moderada</option>
          <option :value="3">3 · Intensa</option>
        </select>

        <label class="field-label" for="event-notes">Notas <span>opcional · máximo 300 caracteres</span></label>
        <textarea id="event-notes" v-model="notes" class="form-control notes-field" maxlength="300" rows="3" />

        <footer class="modal-actions">
          <button v-if="log" class="delete-button" type="button" @click="emit('delete', log.id)"><Trash2 :size="15" /> Eliminar registro</button>
          <button class="secondary-button" type="button" @click="emit('close')">Cancelar</button>
          <button class="primary-button" type="submit">{{ log ? 'Guardar cambios' : 'Guardar registro' }}</button>
        </footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 10; inset: 0; display: grid; place-items: center; padding: 18px; background: #263d4d70; }
.event-modal { width: min(100%, 430px); padding: 22px; border: 1px solid var(--line); border-radius: 10px; background: white; box-shadow: 0 24px 70px #263d4d30; }
.modal-heading { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.modal-item-icon { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; border-radius: 10px; color: var(--slate); font-size: 22px; }
.modal-item-icon.symptom { background: var(--peach); }
.modal-item-icon.trigger { background: var(--mint); }
.modal-item-icon.medication { background: var(--sky); }
.modal-title-copy { min-width: 0; flex: 1; }
.eyebrow { overflow: hidden; margin: 0; color: var(--muted); font-size: 9px; font-weight: 900; letter-spacing: .6px; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
h2 { margin: 3px 0 0; font-size: 20px; font-weight: 900; }
.icon-button { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--ink); cursor: pointer; }
.event-form { display: grid; gap: 8px; padding-top: 18px; }
.field-label { margin-top: 8px; color: var(--ink); font-size: 12px; font-weight: 800; }
.field-label span { color: var(--muted); font-size: 10px; font-weight: 600; }
.form-control { width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--ink); font: inherit; font-size: 13px; }
.form-control:focus { border-color: var(--slate); outline: 2px solid #baddff80; }
.notes-field { resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 15px; }
.modal-actions button { min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.secondary-button { background: white; color: var(--ink); }
.delete-button { display: inline-flex; align-items: center; gap: 5px; margin-right: auto; background: white; }
.delete-button { @apply text-red-600; }
.primary-button { border-color: var(--slate) !important; background: var(--slate); color: white; }
@media (max-width: 480px) { .event-modal { padding: 17px; } .field-label span { display: block; margin-top: 3px; } }
</style>