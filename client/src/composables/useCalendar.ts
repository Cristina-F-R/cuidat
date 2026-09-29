import { computed, ref, type ComputedRef, type Ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import type { CalendarDay } from '@cuidat/shared'

export interface UseCalendarResult {
  activeDate: Ref<Dayjs>
  monthLabel: ComputedRef<string>
  weekdayLabels: string[]
  visibleDays: ComputedRef<CalendarDay[]>
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
}

export function useCalendar(): UseCalendarResult {
  const activeDate = ref(dayjs())
  const weekdayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

  const monthLabel = computed<string>(() => {
    const label = activeDate.value.locale('es').format('MMMM [de] YYYY')
    return label.charAt(0).toLocaleUpperCase('es') + label.slice(1)
  })

  const visibleDays = computed<CalendarDay[]>(() => {
    const firstOfMonth = activeDate.value.startOf('month')
    const mondayOffset = (firstOfMonth.day() + 6) % 7
    const gridStart = firstOfMonth.subtract(mondayOffset, 'day')
    const today = dayjs().format('YYYY-MM-DD')

    return Array.from({ length: 42 }, (_, index) => {
      const date = gridStart.add(index, 'day')
      const dateKey = date.format('YYYY-MM-DD')
      return {
        date: dateKey,
        dayOfMonth: date.date(),
        isCurrentMonth: date.month() === activeDate.value.month(),
        isToday: dateKey === today,
      }
    })
  })

  function goToPreviousMonth(): void {
    activeDate.value = activeDate.value.subtract(1, 'month')
  }

  function goToNextMonth(): void {
    activeDate.value = activeDate.value.add(1, 'month')
  }

  function goToToday(): void {
    activeDate.value = dayjs()
  }

  return {
    activeDate,
    monthLabel,
    weekdayLabels,
    visibleDays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  }
}