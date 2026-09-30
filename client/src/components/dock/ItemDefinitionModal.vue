<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import type { HealthItemDefinition, ItemCategory } from '@cuidat/shared'
import EmojiPalette from './EmojiPalette.vue'

const props = defineProps<{
  category: ItemCategory
  definition?: HealthItemDefinition | null
}>()

const emit = defineEmits<{
  close: []
  save: [definition: HealthItemDefinition]
}>()

const name = ref('')
const category = ref<ItemCategory>(props.definition?.category ?? props.category)
const emoji = ref(props.definition?.emoji ?? (props.category === 'symptom' ? '🩺' : '🥣'))
if (props.definition) name.value = props.definition.name

function submit(): void {
  const cleanName = name.value.trim().slice(0, 100)
  const cleanEmoji = emoji.value.trim().slice(0, 10)
  if (!cleanName || !cleanEmoji) return
  emit('save', {
    id: props.definition?.id ?? crypto.randomUUID(),
    name: cleanName,
    emoji: cleanEmoji,
    category: category.value,
    isActive: true,
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="definition-modal" role="dialog" aria-modal="true" aria-labelledby="definition-title">
      <header><h2 id="definition-title">{{ definition ? 'Editar elemento' : 'Nuevo elemento' }}</h2><button aria-label="Cerrar" @click="emit('close')"><X :size="18" /></button></header>
      <form @submit.prevent="submit">
        <label for="definition-name">Nombre</label>
        <input id="definition-name" v-model="name" maxlength="100" required autofocus />
        <label for="definition-category">Categoría</label>
        <select id="definition-category" v-model="category">
          <option value="symptom">Síntoma</option>
          <option value="trigger">Desencadenante</option>
          <option value="medication">Medicación</option>
        </select>
        <label>Emoji</label>
        <EmojiPalette v-model="emoji" />
        <footer><button class="cancel-button" type="button" @click="emit('close')">Cancelar</button><button class="save-button" type="submit">{{ definition ? 'Guardar cambios' : 'Añadir' }}</button></footer>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 12px;
  background: var(--overlay);
}

.definition-modal {
  display: flex;
  width: min(100%, 380px);
  max-height: calc(100vh - 24px);
  max-height: calc(100dvh - 24px);
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: white;
  box-shadow: 0 20px 60px var(--shadow-soft);
}

header,
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

header { flex: 0 0 auto; }
h2 { margin: 0; font-size: 17px; }

header button {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: white;
  cursor: pointer;
}

form {
  display: grid;
  min-height: 0;
  gap: 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin-top: 18px;
  padding-right: 3px;
}

label { margin-top: 6px; font-size: 12px; font-weight: 800; }

input,
select {
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: white;
  color: var(--slate);
  font: inherit;
}

footer {
  position: sticky;
  bottom: 0;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 10px 0 2px;
  border-top: 1px solid var(--line);
  background: white;
}

footer button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 7px;
  font-weight: 800;
  cursor: pointer;
}

.cancel-button { background: white; color: var(--ink); }
.save-button { border-color: var(--slate); background: var(--slate); color: white; }
</style>