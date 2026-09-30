<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'
import type { CalendarProfile } from '@cuidat/shared'

defineProps<{
  profiles: CalendarProfile[]
  activeProfile: CalendarProfile
}>()

const emit = defineEmits<{
  selectProfile: [profile: CalendarProfile]
  createProfile: []
}>()

const isOpen = ref(false)

function selectProfile(profile: CalendarProfile): void {
  emit('selectProfile', profile)
  isOpen.value = false
}
</script>

<template>
  <div class="profile-selector">
    <button class="profile-trigger" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span class="profile-avatar" aria-hidden="true">{{ activeProfile.avatarIcon }}</span>
      <span class="profile-copy"><strong>{{ activeProfile.name }}</strong><small>{{ activeProfile.type === 'pet' ? 'mascota' : activeProfile.type }}</small></span>
      <ChevronDown :size="15" aria-hidden="true" />
    </button>
    <div v-if="isOpen" class="profile-menu" role="menu" aria-label="Calendarios disponibles">
      <p class="menu-label">Calendarios</p>
      <button v-for="profile in profiles" :key="profile.id" class="profile-option" role="menuitem" :aria-current="profile.id === activeProfile.id ? 'true' : undefined" @click="selectProfile(profile)">
        <span aria-hidden="true">{{ profile.avatarIcon }}</span><span>{{ profile.name }}</span>
      </button>
      <p v-if="profiles.length <= 1" class="empty-profiles">No hay más calendarios registrados</p>
      <button class="create-profile" @click="emit('createProfile'); isOpen = false"><Plus :size="15" /> Nuevo calendario</button>
    </div>
  </div>
</template>

<style scoped>
.profile-selector { position: relative; }
.profile-trigger { display: flex; min-width: 160px; align-items: center; gap: 8px; padding: 5px 9px 5px 6px; border: 1px solid var(--line); border-radius: 8px; background: white; color: var(--slate); text-align: left; cursor: pointer; }
.profile-avatar { display: grid; width: 31px; height: 31px; flex: 0 0 31px; place-items: center; border-radius: 7px; background: var(--tint); }
.profile-copy { display: grid; min-width: 0; flex: 1; gap: 1px; }
.profile-copy strong { overflow: hidden; font-size: 12px; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
.profile-copy small { color: var(--muted); font-size: 10px; text-transform: capitalize; }
.profile-menu { position: absolute; z-index: 15; top: calc(100% + 6px); left: 0; width: max(100%, 250px); padding: 8px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 12px 32px var(--shadow-soft); }
.menu-label { margin: 6px 8px; color: var(--muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }
.profile-option, .create-profile { display: flex; width: 100%; min-height: 38px; align-items: center; gap: 9px; padding: 0 8px; border: 0; border-radius: 6px; background: white; color: var(--slate); text-align: left; font-size: 12px; font-weight: 700; cursor: pointer; }
.profile-option:hover, .create-profile:hover { background: var(--tint); }
.empty-profiles { margin: 8px; color: var(--muted); font-size: 11px; }
.create-profile { margin-top: 5px; border-top: 1px solid var(--line); border-radius: 0 0 6px 6px; color: var(--slate); }
@media (max-width: 600px) { .profile-trigger { min-width: 0; padding-right: 5px; } .profile-copy small { display: none; } }
</style>