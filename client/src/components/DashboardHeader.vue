<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { CalendarProfile } from '@cuidat/shared'

defineProps<{
  profile: CalendarProfile
}>()
</script>

<template>
  <header class="topbar">
      <a class="brand" href="#" aria-label="CuidaT, inicio">
        <span class="brand-mark" aria-hidden="true">🐾</span>
        <span>cuida<span class="brand-t">T</span></span>
      </a>
      <div class="profile-switcher" aria-label="Perfil activo">
        <span class="profile-avatar" aria-hidden="true">{{ profile.avatarIcon }}</span>
        <span class="profile-name">{{ profile.name }} <small>· {{ profile.type === 'pet' ? 'mascota' : profile.type }}</small></span>
        <span class="profile-chevron" aria-hidden="true">⌄</span>
      </div>
      <button class="user-button" aria-label="Perfil de usuario">CR</button>
  </header>

  <div class="page-intro">
    <div><p class="eyebrow">SEGUIMIENTO DIARIO</p><h2>El bienestar, día a día.</h2></div>
    <p class="intro-date">{{ dayjs().locale('es').format('dddd, D [de] MMMM') }}</p>
  </div>
</template>