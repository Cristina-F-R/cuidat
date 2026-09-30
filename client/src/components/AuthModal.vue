<script setup lang="ts">
import { ref } from 'vue'
import { KeyRound, X } from 'lucide-vue-next'

const emit = defineEmits<{
  close: []
  demoAccess: []
  login: [credentials: { email: string; password: string }]
}>()

const email = ref('')
const password = ref('')
const submitted = ref(false)

function submit(): void {
  emit('login', { email: email.value.trim(), password: password.value })
  submitted.value = true
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <header><span class="auth-icon"><KeyRound :size="18" /></span><div><p>CUidAT</p><h2 id="auth-title">Iniciar sesión</h2></div><button aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button></header>
      <form @submit.prevent="submit">
        <label for="auth-email">Correo electrónico</label><input id="auth-email" v-model="email" type="email" autocomplete="username" required />
        <label for="auth-password">Contraseña</label><input id="auth-password" v-model="password" type="password" autocomplete="current-password" required />
        <p v-if="submitted" class="phase-note" role="status">El acceso con cuenta estará disponible en la Fase 3.</p>
        <button class="login-button" type="submit">Continuar</button>
      </form>
      <div class="divider"><span>o continúa con</span></div>
      <button class="demo-button" @click="emit('demoAccess')"><span aria-hidden="true">🐾</span> Acceso Demo / Evaluador (1-click)</button>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--overlay); }
.auth-modal { width: min(100%, 410px); padding: 22px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 20px 60px var(--shadow-soft); }
header { display: flex; align-items: center; gap: 11px; }
header > div { flex: 1; }
header p { margin: 0; color: var(--muted); font-size: 9px; font-weight: 900; }
h2 { margin: 2px 0 0; font-size: 19px; }
header button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 7px; background: white; cursor: pointer; }
.auth-icon { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 8px; background: var(--sky); color: var(--slate); }
form { display: grid; gap: 8px; margin-top: 19px; }
label { margin-top: 4px; font-size: 12px; font-weight: 800; }
input { min-height: 42px; padding: 9px 11px; border: 1px solid var(--line); border-radius: 7px; font: inherit; }
.login-button, .demo-button { min-height: 42px; border: 1px solid var(--slate); border-radius: 7px; font-size: 12px; font-weight: 800; cursor: pointer; }
.login-button { margin-top: 8px; background: var(--slate); color: white; }
.phase-note { margin: 2px 0 0; color: var(--muted); font-size: 11px; }
.divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 12px; color: var(--muted); font-size: 10px; }
.divider::before, .divider::after { height: 1px; flex: 1; background: var(--line); content: ''; }
.demo-button { display: flex; width: 100%; align-items: center; justify-content: center; gap: 8px; background: var(--mint); color: var(--slate); }
</style>