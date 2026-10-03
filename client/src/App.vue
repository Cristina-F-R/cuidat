<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import SidebarDock from './components/dock/SidebarDock.vue'
import CalendarGrid from './components/calendar/CalendarGrid.vue'
import MonthlyInsightsSummary from './components/summary/MonthlyInsightsSummary.vue'
import EventLogModal from './components/modals/EventLogModal.vue'
import ConfirmCascadeModal from './components/modals/ConfirmCascadeModal.vue'
import DaySummaryModal from './components/DaySummaryModal.vue'
import { useDashboard } from './composables/useDashboard'
import { useAccountSession } from './composables/useAccountSession'

const {
  authStore, authBusy, authError, authSuccessVersion,
  deleteBusy, deleteError, deleteSuccessVersion,
  login, upgrade, logout, exportData, deleteAccount,
} = useAccountSession()

const {
  profile, profiles, items, profileEntries, monthLabel, weekdayLabels, visibleDays,
  goToPreviousMonth, goToNextMonth, goToToday,
  isTouchMode, selectedItem, selectItem, startItemDrag,
  selectedFilter, consultationMode, modalItem, modalDate, modalLog, daySummaryDate, pendingCascade,
  monthlyEntries, calendarEntries, openExistingLog, closeLog, selectDay,
  dropItem, saveLog, deleteLog, addItem, updateItem, requestDeleteItem, enterDemo,
  setConsultationMode, showCorrelations, selectProfile, createProfile, closeDaySummary,
  cancelCascadeDelete, confirmCascadeDelete,
} = useDashboard()

</script>
<template>
  <main class="app-shell">
    <AppHeader
      :profile="profile"
      :profiles="profiles"
      :authenticated="authStore.isAuthenticated"
      :user-email="authStore.email"
      :auth-busy="authBusy"
      :auth-error="authError"
      :auth-success-version="authSuccessVersion"
      :delete-busy="deleteBusy"
      :delete-error="deleteError"
      :delete-success-version="deleteSuccessVersion"
      @demo-access="enterDemo"
      @login="login"
      @upgrade="upgrade"
      @export-data="exportData"
      @logout="logout"
      @delete-account="deleteAccount"
      @select-profile="selectProfile"
      @create-profile="createProfile"
    />

    <div class="workspace-shell" :class="{ 'consultation-layout': consultationMode }">
      <div class="calendar-region">
        <CalendarGrid
          :days="visibleDays"
          :month-label="monthLabel"
          :weekday-labels="weekdayLabels"
          :entries="calendarEntries"
          :filter="selectedFilter"
          :touch-mode="isTouchMode"
          :selected-item="selectedItem"
          :consultation-mode="consultationMode"
          @previous-month="goToPreviousMonth"
          @next-month="goToNextMonth"
          @today="goToToday"
          @select-day="selectDay"
          @drop-item="dropItem"
          @edit-event="openExistingLog"
          @filter-change="selectedFilter = $event"
          @consultation-mode-change="setConsultationMode"
        />
      </div>
      <div class="summary-region">
        <MonthlyInsightsSummary
          :month-label="monthLabel"
          :entries="monthlyEntries"
          @show-correlations="showCorrelations"
        />
      </div>
      <div v-if="!consultationMode" class="dock-region">
        <SidebarDock
          :items="items"
          :selected-item-id="selectedItem?.id ?? null"
          :touch-mode="isTouchMode"
          @select-item="selectItem"
          @drag-item="startItemDrag"
          @add-item="addItem"
          @update-item="updateItem"
          @delete-item="requestDeleteItem"
        />
      </div>
    </div>

    <footer class="app-footer"><span>CuidaT</span> · Un registro claro para conversaciones más informadas.</footer>

    <EventLogModal
      v-if="modalItem"
      :item="modalItem"
      :date="modalDate"
      :log="modalLog"
      @close="closeLog"
      @save="saveLog"
      @delete="deleteLog"
    />
    <DaySummaryModal
      v-if="daySummaryDate"
      :date="daySummaryDate"
      :entries="profileEntries"
      @close="closeDaySummary"
    />
    <ConfirmCascadeModal
      v-if="pendingCascade"
      :item-name="pendingCascade.item.name"
      :event-count="pendingCascade.eventCount"
      @cancel="cancelCascadeDelete"
      @confirm="confirmCascadeDelete"
    />
  </main>
</template>
