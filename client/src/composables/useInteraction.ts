import { computed, onMounted, onUnmounted, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { HealthItemDefinition } from '@cuidat/shared'

export const TOUCH_BREAKPOINT_PX = 768
const DRAG_DATA_TYPE = 'application/x-cuidat-item'

export interface UseInteractionResult {
  isTouchMode: Ref<boolean>
  selectedItem: ComputedRef<HealthItemDefinition | null>
  selectItem: (item: HealthItemDefinition) => void
  clearSelection: () => void
  startItemDrag: (item: HealthItemDefinition, event: DragEvent) => void
  getDraggedItemId: (event: DragEvent) => string | null
}

export function useInteraction(items: MaybeRefOrGetter<HealthItemDefinition[]>): UseInteractionResult {
  const isTouchMode = ref(false)
  const selectedItemId = ref<string | null>(null)
  const selectedItem = computed<HealthItemDefinition | null>(() =>
    toValue(items).find((item) => item.id === selectedItemId.value && item.isActive) ?? null,
  )
  watch(() => toValue(items), (currentItems) => {
    if (!currentItems.some((item) => item.id === selectedItemId.value && item.isActive)) selectedItemId.value = null
  })
  let mediaQuery: MediaQueryList | null = null

  function updateInputMode(): void {
    isTouchMode.value = mediaQuery?.matches ?? false
    if (!isTouchMode.value) selectedItemId.value = null
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(`(max-width: ${TOUCH_BREAKPOINT_PX - 1}px)`)
    updateInputMode()
    mediaQuery.addEventListener('change', updateInputMode)
  })

  onUnmounted(() => mediaQuery?.removeEventListener('change', updateInputMode))

  function selectItem(item: HealthItemDefinition): void {
    selectedItemId.value = selectedItemId.value === item.id ? null : item.id
  }

  function clearSelection(): void {
    selectedItemId.value = null
  }

  function startItemDrag(item: HealthItemDefinition, event: DragEvent): void {
    if (!event.dataTransfer) return
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(DRAG_DATA_TYPE, item.id)
    event.dataTransfer.setData('text/plain', item.id)
  }

  function getDraggedItemId(event: DragEvent): string | null {
    return event.dataTransfer?.getData(DRAG_DATA_TYPE)
      || event.dataTransfer?.getData('text/plain')
      || null
  }

  return {
    isTouchMode,
    selectedItem,
    selectItem,
    clearSelection,
    startItemDrag,
    getDraggedItemId,
  }
}