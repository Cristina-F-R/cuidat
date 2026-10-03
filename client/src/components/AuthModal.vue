<script setup lang="ts">
import { ref } from 'vue'
import { KeyRound, X } from 'lucide-vue-next'

defineProps<{
  busy: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  demoAccess: []
  login: [credentials: { email: string; password: string }]
  upgrade: [credentials: { email: string; password: string }]
}>()

const email = ref('')
const password = ref('')
const isRegistering = ref(false)

function submit(): void {
  const credentials = { email: email.value.trim(), password: password.value }
  if (isRegistering.value) emit('upgrade', credentials)
  else emit('login', credentials)
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <header><span class="auth-icon"><KeyRound :size="18" /></span><div><p>CUidAT</p><h2 id="auth-title">{{ isRegistering ? 'Crear cuenta' : 'Iniciar sesión' }}</h2></div><button aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button></header>
      <form @submit.prevent="submit">
        <label for="auth-email">Correo electrónico</label><input id="auth-email" v-model="email" type="email" autocomplete="username" required />
        <label for="auth-password">Contraseña</label><input id="auth-password" v-model="password" type="password" :autocomplete="isRegistering ? 'new-password' : 'current-password'" minlength="8" maxlength="128" required />
        <p v-if="errorMessage" class="phase-note" role="alert">{{ errorMessage }}</p>
        <button class="login-button" type="submit" :disabled="busy">{{ busy ? 'Procesando…' : (isRegistering ? 'Crear cuenta y migrar datos' : 'Continuar') }}</button>
      </form>
      <button class="mode-button" type="button" @click="isRegistering = !isRegistering">{{ isRegistering ? 'Ya tengo una cuenta' : 'Crear cuenta y conservar mis datos' }}</button>
      <div class="divider"><span>o continúa con</span></div>
      <button class="demo-button" @click="emit('demoAccess')"><span aria-hidden="true">🐾</span> Acceso Demo / Evaluador (1-click)</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; overflow-y: auto; padding: 18px; background: var(--overlay); }
.auth-modal { width: min(100%, 410px); max-height: calc(100dvh - 36px); overflow-y: auto; padding: 22px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 20px 60px var(--shadow-soft); }
header { display: flex; align-items: center; gap: 11px; }
header > div { flex: 1; }
header p { margin: 0; color: var(--muted); font-size: 9px; font-weight: 900; }
h2 { margin: 2px 0 0; font-size: 19px; }
header button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 7px; background: white; cursor: pointer; }
.auth-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 8px; background: var(--sky); color: var(--slate); }
form { display: grid; min-width: 0; gap: 8px; margin-top: 19px; }
label { margin-top: 4px; font-size: 12px; font-weight: 800; }
input { width: 100%; min-width: 0; min-height: 42px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 7px; font: inherit; }
.login-button, .demo-button { min-height: 42px; border: 1px solid var(--slate); border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.auth-modal .login-button, .auth-modal .demo-button { width: 100%; justify-self: stretch; justify-content: center; white-space: normal; line-height: 1.35; }
.login-button:disabled { cursor: wait; opacity: .7; }
.auth-modal .login-button { margin-top: 8px; padding: 8px 12px; background: var(--slate); color: white; }
.phase-note { margin: 2px 0 0; color: var(--muted); font-size: 11px; }
.mode-button { width: 100%; min-height: 36px; justify-self: stretch; padding: 8px 0 0; border: 0; background: transparent; color: var(--slate); font: inherit; font-size: 11px; font-weight: 800; line-height: 1.35; text-align: left; text-decoration: underline; white-space: normal; overflow-wrap: anywhere; cursor: pointer; }
.divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 12px; color: var(--muted); font-size: 10px; }
.divider::before, .divider::after { height: 1px; flex: 1; background: var(--line); content: ''; }
.demo-button { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--mint); color: var(--slate); }
@media (max-width: 480px) { .auth-modal { padding: 18px; } }
</style>