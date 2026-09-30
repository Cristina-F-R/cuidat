<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import { LogIn } from 'lucide-vue-next'
import 'dayjs/locale/es'
import type { CalendarProfile } from '@cuidat/shared'
import ProfileSelector from './ProfileSelector.vue'
import ProfileCreateModal from './ProfileCreateModal.vue'
import AuthModal from './AuthModal.vue'

defineProps<{
  profile: CalendarProfile
  profiles: CalendarProfile[]
}>()

const emit = defineEmits<{
  demoAccess: []
  selectProfile: [profile: CalendarProfile]
  createProfile: [profile: CalendarProfile]
  login: [credentials: { email: string; password: string }]
}>()

const isAuthOpen = ref(false)
const isProfileCreateOpen = ref(false)

function enterDemo(): void {
  isAuthOpen.value = false
  emit('demoAccess')
}

function createProfile(profile: CalendarProfile): void {
  isProfileCreateOpen.value = false
  emit('createProfile', profile)
}
</script>

<template>
  <header class="topbar">
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
      <button class="login-button" aria-label="Iniciar sesión" @click="isAuthOpen = true"><LogIn :size="16" /><span>Iniciar sesión</span></button>
  </header>

  <div class="page-intro">
    <div><p class="eyebrow">SEGUIMIENTO DIARIO</p><h2>El bienestar, día a día.</h2></div>
    <p class="intro-date">{{ dayjs().locale('es').format('dddd, D [de] MMMM') }}</p>
  </div>
  <AuthModal v-if="isAuthOpen" @close="isAuthOpen = false" @demo-access="enterDemo" @login="emit('login', $event)" />
  <ProfileCreateModal v-if="isProfileCreateOpen" @close="isProfileCreateOpen = false" @save="createProfile" />
</template>