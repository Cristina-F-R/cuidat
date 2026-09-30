<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [avatar: string]
}>()

const avatars = ['👤', '👶', '👧', '👦', '👵', '🧓', '🐱', '🐶', '🐰', '🐾', '✨']
</script>

<template>
  <div class="avatar-options" role="group" aria-label="Selecciona un icono de perfil">
    <button
      v-for="avatar in avatars"
      :key="avatar"
      type="button"
      :aria-label="`Usar ${avatar} como icono del perfil`"
      :aria-pressed="props.modelValue === avatar"
      @click="emit('update:modelValue', avatar)"
    >
      {{ avatar }}
    </button>
  </div>
</template>

<style scoped>
.avatar-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
  gap: 7px;
}

.avatar-options button {
  display: grid;
  min-width: 0;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--tint);
  color: var(--slate);
  font-size: 21px;
  cursor: pointer;
}

.avatar-options button[aria-pressed='true'] {
  border-color: var(--slate);
  background: var(--mint);
  box-shadow: inset 0 0 0 1px var(--slate);
}
</style>
