import { ref, type Ref } from 'vue'
import { authenticatedDelete, loginRequest, upgradeRequest } from '../services/api'
import { useAuthStore } from '../stores/useAuthStore'
import { clearGuestState, readGuestState } from '../stores/guestStorage'
import { useEventStore } from '../stores/useEventStore'
import { useItemDefinitionStore } from '../stores/useItemDefinitionStore'
import { useProfileStore } from '../stores/useProfileStore'

type Credentials = { email: string; password: string }

export interface AccountSession {
  authStore: ReturnType<typeof useAuthStore>
  authBusy: Ref<boolean>
  authError: Ref<string>
  authSuccessVersion: Ref<number>
  deleteBusy: Ref<boolean>
  deleteError: Ref<string>
  deleteSuccessVersion: Ref<number>
  login: (credentials: Credentials) => Promise<void>
  upgrade: (credentials: Credentials) => Promise<void>
  logout: () => void
  exportData: () => void
  deleteAccount: () => Promise<void>
}

export function useAccountSession(): AccountSession {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  const itemDefinitionStore = useItemDefinitionStore()
  const eventStore = useEventStore()
  const authBusy = ref(false)
  const authError = ref('')
  const authSuccessVersion = ref(0)
  const deleteBusy = ref(false)
  const deleteError = ref('')
  const deleteSuccessVersion = ref(0)

  async function login(credentials: Credentials): Promise<void> {
    authBusy.value = true
    authError.value = ''
    try {
      const result = await loginRequest(credentials)
      authStore.setSession(result.token, result.email)
      authSuccessVersion.value += 1
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión.'
    } finally {
      authBusy.value = false
    }
  }

  async function upgrade(credentials: Credentials): Promise<void> {
    authBusy.value = true
    authError.value = ''
    try {
      const result = await upgradeRequest({ ...credentials, guestState: readGuestState() })
      authStore.setSession(result.token, result.email)
      clearGuestState()
      authSuccessVersion.value += 1
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'No se pudo crear la cuenta.'
    } finally {
      authBusy.value = false
    }
  }

  function resetToGuest(): void {
    clearGuestState()
    authStore.continueAsGuest()
    profileStore.resetState()
    itemDefinitionStore.resetState()
    eventStore.resetState()
  }

  function logout(): void {
    resetToGuest()
  }

  function exportData(): void {
    const backup = {
      format: 'cuidat-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles: profileStore.profiles,
      itemDefinitions: itemDefinitionStore.itemDefinitions,
      events: eventStore.events,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cuidat_backup_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  async function deleteAccount(): Promise<void> {
    deleteBusy.value = true
    deleteError.value = ''
    try {
      await authenticatedDelete('/auth/account')
      resetToGuest()
      deleteSuccessVersion.value += 1
    } catch (error) {
      deleteError.value = error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.'
    } finally {
      deleteBusy.value = false
    }
  }

  return {
    authStore,
    authBusy,
    authError,
    authSuccessVersion,
    deleteBusy,
    deleteError,
    deleteSuccessVersion,
    login,
    upgrade,
    logout,
    exportData,
    deleteAccount,
  }
}