import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { persistGuestField, readGuestState } from './guestStorage'

export const useAuthStore = defineStore('auth', () => {
  const mode = ref<'guest' | 'demo'>(readGuestState().authMode)
  const isDemo = computed<boolean>(() => mode.value === 'demo')

  watch(mode, (value) => persistGuestField('authMode', value), { immediate: true })

  function enterDemo(): void {
    mode.value = 'demo'
  }

  function continueAsGuest(): void {
    mode.value = 'guest'
  }

  return { mode, isDemo, enterDemo, continueAsGuest }
})