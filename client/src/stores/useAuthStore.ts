import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { AUTH_EMAIL_KEY, AUTH_TOKEN_KEY, persistGuestField, readGuestState } from './guestStorage'

function readToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

function readEmail(): string {
  try {
    return localStorage.getItem(AUTH_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}

export const useAuthStore = defineStore('auth', () => {
  const mode = ref<'guest' | 'demo'>(readGuestState().authMode)
  const token = ref<string | null>(readToken())
  const email = ref<string>(readEmail())
  const isDemo = computed<boolean>(() => mode.value === 'demo')
  const isAuthenticated = computed<boolean>(() => token.value !== null)

  watch(mode, (value) => persistGuestField('authMode', value), { immediate: true })

  function enterDemo(): void {
    setSession(null, '')
    mode.value = 'demo'
  }

  function continueAsGuest(): void {
    setSession(null, '')
    mode.value = 'guest'
  }

  function setSession(value: string | null, userEmail: string): void {
    token.value = value
    email.value = value ? userEmail : ''
    try {
      if (value) {
        localStorage.setItem(AUTH_TOKEN_KEY, value)
        localStorage.setItem(AUTH_EMAIL_KEY, userEmail)
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_EMAIL_KEY)
      }
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }

  return { mode, token, email, isDemo, isAuthenticated, enterDemo, continueAsGuest, setSession }
})