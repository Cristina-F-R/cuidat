import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CalendarProfile } from '@cuidat/shared'
import { DEFAULT_PROFILE } from './defaults'
import { persistGuestField, readGuestState } from './guestStorage'

const initialGuestState = readGuestState()

export const useProfileStore = defineStore('profiles', () => {
  const profiles = ref<CalendarProfile[]>(initialGuestState.profiles.length
    ? initialGuestState.profiles
    : [DEFAULT_PROFILE])
  const activeProfileId = ref<string | null>(initialGuestState.activeProfileId ?? profiles.value[0]?.id ?? null)
  const activeProfile = computed<CalendarProfile | null>(() =>
    profiles.value.find((profile) => profile.id === activeProfileId.value) ?? null,
  )

  watch(profiles, (value) => persistGuestField('profiles', value), { deep: true, immediate: true })
  watch(activeProfileId, (value) => persistGuestField('activeProfileId', value), { immediate: true })

  function setActiveProfile(profile: CalendarProfile): void {
    if (!profiles.value.some((candidate) => candidate.id === profile.id)) profiles.value.push(profile)
    activeProfileId.value = profile.id
  }

  function addProfile(profile: CalendarProfile): void {
    profiles.value.push(profile)
    activeProfileId.value = profile.id
  }

  function replaceProfiles(nextProfiles: CalendarProfile[], nextActiveProfileId: string | null): void {
    profiles.value = nextProfiles
    activeProfileId.value = nextActiveProfileId
  }

  return { profiles, activeProfileId, activeProfile, setActiveProfile, addProfile, replaceProfiles }
})