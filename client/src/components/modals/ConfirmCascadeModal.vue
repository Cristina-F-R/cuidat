<script setup lang="ts">
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'

defineProps<{
  itemName: string
  eventCount: number
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <section class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="cascade-title" aria-describedby="cascade-description">
      <header class="modal-heading">
        <span class="warning-icon"><AlertTriangle :size="19" aria-hidden="true" /></span>
        <h2 id="cascade-title">Eliminar elemento y registros</h2>
        <button class="close-button" aria-label="Cerrar" @click="emit('cancel')"><X :size="17" /></button>
      </header>
      <p id="cascade-description" class="cascade-message">
        <strong>{{ itemName }}</strong> tiene {{ eventCount }} {{ eventCount === 1 ? 'registro asociado' : 'registros asociados' }}.
        Se eliminará este elemento y todos sus registros del calendario. Esta acción no se puede deshacer.
      </p>
      <footer class="modal-actions">
        <button class="cancel-button" @click="emit('cancel')">Cancelar</button>
        <button class="confirm-button" @click="emit('confirm')"><Trash2 :size="15" /> Eliminar {{ eventCount }} {{ eventCount === 1 ? 'registro' : 'registros' }}</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 40; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--overlay); }
.confirm-modal { width: min(100%, 420px); padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 20px 60px var(--shadow-soft); }
.modal-heading { display: flex; align-items: center; gap: 10px; }
.warning-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 7px; background: var(--peach); color: var(--slate); }
h2 { flex: 1; margin: 0; color: var(--slate); font-size: 17px; }
.close-button { display: grid; width: 32px; height: 32px; flex: 0 0 32px; place-items: center; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--slate); cursor: pointer; }
.cascade-message { margin: 16px 0 20px; color: var(--ink); font-size: 13px; line-height: 1.55; }
.cascade-message strong { color: var(--slate); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.modal-actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border: 1px solid var(--line); border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.cancel-button { background: white; color: var(--slate); }
.confirm-button { border-color: var(--peach); background: var(--peach); color: var(--slate); }
.confirm-button:hover { filter: brightness(.96); }
@media (max-width: 420px) { .confirm-modal { padding: 16px; } .modal-actions button { flex: 1; padding: 0 9px; } }
</style>
