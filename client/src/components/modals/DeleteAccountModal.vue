<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'
import DOMPurify from 'dompurify'

const DELETION_CONFIRM_KEYWORD = 'ELIMINAR'

defineProps<{
  busy: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmationText = ref('')
const canDelete = computed<boolean>(() => confirmationText.value === DELETION_CONFIRM_KEYWORD)

function updateConfirmation(event: Event): void {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  confirmationText.value = DOMPurify.sanitize(input.value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
</script>

<template>
  <div class="delete-backdrop" @click.self="emit('close')">
    <section class="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" aria-describedby="delete-account-description">
      <header>
        <span class="warning-icon"><AlertTriangle :size="19" /></span>
        <h2 id="delete-account-title">Eliminar cuenta y datos</h2>
        <button class="close-button" type="button" aria-label="Cerrar" :disabled="busy" @click="emit('close')"><X :size="18" /></button>
      </header>
      <p id="delete-account-description">Esta acción es permanente. Se eliminarán tu cuenta, calendarios, registros y datos asociados. No podrás recuperarlos.</p>
      <label for="delete-account-confirmation">Escribe <strong>ELIMINAR</strong> para confirmar</label>
      <input id="delete-account-confirmation" type="text" autocomplete="off" :disabled="busy" @input="updateConfirmation" />
      <p v-if="errorMessage" class="delete-error" role="alert">{{ errorMessage }}</p>
      <footer>
        <button class="cancel-button" type="button" :disabled="busy" @click="emit('close')">Cancelar</button>
        <button class="confirm-button" type="button" :disabled="!canDelete || busy" @click="emit('confirm')">{{ busy ? 'Eliminando…' : 'Eliminar permanentemente' }}</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.delete-backdrop { position: fixed; z-index: 40; inset: 0; display: grid; place-items: center; padding: 16px; background: var(--overlay); }
.delete-dialog { width: min(100%, 440px); padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: var(--canvas); box-shadow: 0 20px 60px var(--shadow-soft); }
header { display: flex; align-items: center; gap: 10px; }
header h2 { flex: 1; margin: 0; color: var(--ink); font-size: 17px; font-weight: 900; }
.warning-icon { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border-radius: 8px; background: #fef2f2; color: #dc2626; }
.close-button { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--slate); cursor: pointer; }
.delete-dialog > p { margin: 14px 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
label { display: block; margin: 18px 0 6px; color: var(--slate); font-size: 12px; font-weight: 700; }
input { width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--slate); font: inherit; }
input:focus { border-color: var(--slate); outline: 2px solid #49658033; }
.delete-dialog .delete-error { margin: 8px 0 0; color: #b91c1c; font-size: 12px; }
footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
footer button { min-height: 39px; padding: 0 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; }
.cancel-button { background: white; color: var(--slate); }
.confirm-button { border-color: #dc2626; background: #dc2626; color: white; transition: background-color .15s ease; }
.confirm-button:hover:not(:disabled) { background: #b91c1c; }
.confirm-button:disabled { border-color: #cbd5e1; background: #cbd5e1; color: #64748b; cursor: not-allowed; opacity: .5; }
button:disabled { cursor: not-allowed; }
</style>