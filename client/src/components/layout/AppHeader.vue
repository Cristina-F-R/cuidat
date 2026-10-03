<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { ChevronDown, Download, LogIn, LogOut, Trash2 } from 'lucide-vue-next'
import 'dayjs/locale/es'
import type { CalendarProfile } from '@cuidat/shared'
import ProfileSelector from '../ProfileSelector.vue'
import ProfileCreateModal from '../ProfileCreateModal.vue'
import AuthModal from '../AuthModal.vue'
import DeleteAccountModal from '../modals/DeleteAccountModal.vue'

const props = defineProps<{
  profile: CalendarProfile
  profiles: CalendarProfile[]
  authenticated: boolean
  userEmail: string
  authBusy: boolean
  authError: string
  authSuccessVersion: number
  deleteBusy: boolean
  deleteError: string
  deleteSuccessVersion: number
}>()

const emit = defineEmits<{
  demoAccess: []
  selectProfile: [profile: CalendarProfile]
  createProfile: [profile: CalendarProfile]
  login: [credentials: { email: string; password: string }]
  upgrade: [credentials: { email: string; password: string }]
  exportData: []
  logout: []
  deleteAccount: []
}>()

const isAuthOpen = ref(false)
const isProfileCreateOpen = ref(false)
const isUserMenuOpen = ref(false)
const isDeleteOpen = ref(false)

watch(() => props.authSuccessVersion, (version) => {
  if (version > 0) isAuthOpen.value = false
})
watch(() => props.deleteSuccessVersion, (version) => {
  if (version > 0) isDeleteOpen.value = false
})

function enterDemo(): void {
  isAuthOpen.value = false
  emit('demoAccess')
}

function createProfile(profile: CalendarProfile): void {
  isProfileCreateOpen.value = false
  emit('createProfile', profile)
}

function exportData(): void {
  isUserMenuOpen.value = false
  emit('exportData')
}

function logout(): void {
  isUserMenuOpen.value = false
  emit('logout')
}

function openDeleteAccount(): void {
  isUserMenuOpen.value = false
  isDeleteOpen.value = true
}
</script>

<template>
  <header class="app-header">
    <div class="topbar">
      <a class="brand" href="#" aria-label="CuidaT, inicio">
        <span class="brand-mark" aria-hidden="true">🐾</span>
        <span>cuida<span class="brand-t">T</span></span>
      </a>
      <ProfileSelector
        :profiles="profiles"
        :active-profile="profile"
        @select-profile="emit('selectProfile', $event)"
        @create-profile="isProfileCreateOpen = true"
      />
      <div class="session-actions">
        <span v-if="authenticated" class="session-badge synced">Sincronizado</span>
        <span v-else class="session-badge local">Modo Local</span>
        <button v-if="!authenticated" class="login-button" aria-label="Iniciar sesión" @click="isAuthOpen = true">
          <LogIn :size="16" /><span>Iniciar sesión</span>
        </button>
        <div v-else class="user-menu-wrap">
          <button class="user-menu-trigger" :aria-expanded="isUserMenuOpen" aria-haspopup="menu" @click="isUserMenuOpen = !isUserMenuOpen">
            <span class="user-email">{{ userEmail }}</span><ChevronDown :size="15" aria-hidden="true" />
          </button>
          <div v-if="isUserMenuOpen" class="user-menu" role="menu" aria-label="Menú de cuenta">
            <p class="menu-email">{{ userEmail }}</p>
            <button role="menuitem" @click="exportData"><Download :size="15" />Descargar mis datos (JSON)</button>
            <button role="menuitem" @click="logout"><LogOut :size="15" />Cerrar sesión</button>
            <button class="delete-account-action" role="menuitem" @click="openDeleteAccount"><Trash2 :size="15" />Eliminar cuenta y datos</button>
          </div>
        </div>
      </div>
    </div>

    <div class="page-intro">
      <div><p class="eyebrow">SEGUIMIENTO DIARIO</p><h2>El bienestar, día a día.</h2></div>
      <p class="intro-date">{{ dayjs().locale('es').format('dddd, D [de] MMMM') }}</p>
    </div>
    <AuthModal v-if="isAuthOpen" :busy="authBusy" :error-message="authError" @close="isAuthOpen = false" @demo-access="enterDemo" @login="emit('login', $event)" @upgrade="emit('upgrade', $event)" />
    <ProfileCreateModal v-if="isProfileCreateOpen" @close="isProfileCreateOpen = false" @save="createProfile" />
    <DeleteAccountModal v-if="isDeleteOpen" :busy="deleteBusy" :error-message="deleteError" @close="isDeleteOpen = false" @confirm="emit('deleteAccount')" />
  </header>
</template>

<style scoped>
.app-header { min-width: 0; }
.topbar { grid-template-columns: 1fr auto 1fr; }
.session-actions { display: flex; min-width: 0; align-items: center; justify-self: end; gap: 8px; }
.session-badge { display: inline-flex; min-height: 27px; align-items: center; padding: 0 9px; border: 1px solid; border-radius: 999px; font-size: 10px; font-weight: 800; white-space: nowrap; }
.session-badge.local { border-color: #dce6ec; background: #f1f5f9; color: #475569; }
.session-badge.synced { @apply border-mint bg-mint/40 text-slate; }
.user-menu-wrap { position: relative; }
.user-menu-trigger { display: flex; max-width: 240px; min-height: 36px; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--canvas); color: var(--slate); font-size: 11px; font-weight: 800; cursor: pointer; }
.user-email { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-menu { position: absolute; z-index: 20; top: calc(100% + 7px); right: 0; width: min(280px, calc(100vw - 24px)); padding: 7px; border: 1px solid var(--line); border-radius: 8px; background: var(--canvas); box-shadow: 0 12px 32px var(--shadow-soft); }
.menu-email { overflow: hidden; margin: 5px 8px 8px; color: var(--muted); font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.user-menu button { display: flex; width: 100%; min-height: 38px; align-items: center; gap: 9px; padding: 0 9px; border: 0; border-radius: 6px; background: transparent; color: var(--slate); text-align: left; font-size: 11px; font-weight: 700; cursor: pointer; }
.user-menu button:hover { background: var(--tint); }
.user-menu .delete-account-action { color: #dc2626; }
.user-menu .delete-account-action:hover { background: #fef2f2; }
@media (max-width: 760px) { .topbar { grid-template-columns: minmax(0, 1fr) auto; } .topbar > :nth-child(2) { grid-column: 1; grid-row: 2; justify-self: start; margin: 0 0 8px; } .session-actions { grid-column: 2; grid-row: 1 / span 2; } .session-badge { display: none; } .user-menu-trigger { max-width: 170px; padding: 0 7px; } }
@media (max-width: 420px) { .user-menu-trigger { max-width: 38px; justify-content: center; } .user-email { display: none; } }
</style>