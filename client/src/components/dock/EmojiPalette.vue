<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [emoji: string]
}>()

const groups = [
  { label: 'Alimentos', emojis: ['🥣', '🍗', '🍚', '🥕', '🥛', '🌾', '🐟', '🥚', '🍫', '🥩', '☕', '🍷'] },
  { label: 'Desencadenantes', emojis: ['🏃', '🌳', '☀️', '💨', '⚡', '⚠️'] },
  { label: 'Digestivo', emojis: ['🤢', '🤮', '💩'] },
  { label: 'Síntomas', emojis: ['🐾', '🩺', '🌡️', '😴', '🤧', '😵', '👂', '👁️', '🥱', '🤕'] },
  { label: 'Medicación', emojis: ['💊', '🧴', '💉', '🩹', '💧'] },
]
</script>

<template>
  <div class="emoji-groups" aria-label="Selecciona un emoji">
    <section v-for="group in groups" :key="group.label" class="emoji-group">
      <h3>{{ group.label }}</h3>
      <div class="emoji-options">
        <button
          v-for="emoji in group.emojis"
          :key="emoji"
          type="button"
          :aria-label="`${emoji} ${group.label}`"
          :aria-pressed="props.modelValue === emoji"
          @click="emit('update:modelValue', emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.emoji-groups {
  display: grid;
  gap: 9px;
}

.emoji-group h3 {
  margin: 0 0 5px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
}

.emoji-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.emoji-options button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--sky);
  font-size: 20px;
  cursor: pointer;
}

.emoji-options button[aria-pressed='true'] {
  border-color: var(--slate);
  background: var(--mint);
  box-shadow: inset 0 0 0 1px var(--slate);
}

@media (max-width: 420px) {
  .emoji-options button {
    width: 38px;
    height: 38px;
  }
}
</style>