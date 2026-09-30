<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import DOMPurify from 'dompurify'
import type { CalendarProfile, ProfileType } from '@cuidat/shared'
import ProfileAvatarPicker from './ProfileAvatarPicker.vue'

const emit = defineEmits<{
  close: []
  save: [profile: CalendarProfile]
}>()

const name = ref('')
const type = ref<ProfileType>('pet')
const avatarIcon = ref('🐾')

function submit(): void {
  const cleanName = DOMPurify.sanitize(name.value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 100)
  if (!cleanName) return
  emit('save', { id: crypto.randomUUID(), name: cleanName, type: type.value, avatarIcon: avatarIcon.value })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <header><h2 id="profile-modal-title">Nuevo calendario</h2><button aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button></header>
      <form @submit.prevent="submit">
        <label for="profile-name">Nombre</label><input id="profile-name" v-model="name" maxlength="100" required autofocus />
        <label for="profile-type">Tipo de perfil</label><select id="profile-type" v-model="type"><option value="pet">Mascota</option><option value="child">Niño o niña</option><option value="adult">Adulto</option><option value="custom">Otro</option></select>
        <label>Icono del perfil</label><ProfileAvatarPicker v-model="avatarIcon" />
        <footer><button type="button" class="cancel" @click="emit('close')">Cancelar</button><button type="submit" class="save">Crear calendario</button></footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; padding: 18px; background: var(--overlay); }
.profile-modal { width: min(100%, 390px); padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: white; box-shadow: 0 20px 60px var(--shadow-soft); }
header, footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
h2 { margin: 0; font-size: 18px; }
header button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--line); border-radius: 7px; background: white; cursor: pointer; }
form { display: grid; gap: 8px; margin-top: 18px; }
label { margin-top: 5px; font-size: 12px; font-weight: 800; }
input, select { min-height: 40px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--slate); font: inherit; }
footer { justify-content: flex-end; margin-top: 12px; }
footer button { min-height: 38px; padding: 0 13px; border: 1px solid var(--line); border-radius: 7px; font-weight: 800; cursor: pointer; }
.cancel { background: white; color: var(--slate); }
.save { border-color: var(--slate); background: var(--slate); color: white; }
</style>