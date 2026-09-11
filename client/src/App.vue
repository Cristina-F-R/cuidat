<script setup lang="ts">
</script>

<template>
  <main class="min-h-screen bg-canvas p-8 flex flex-col items-center justify-center gap-6">
    <div class="bg-tint p-6 rounded-2xl border border-slate shadow-sm max-w-md w-full text-center">
      <h1 class="text-2xl font-extrabold text-slate mb-2">
        CuidaT - Tokens Activos
      </h1>
      <p class="text-slate text-sm mb-4">
        Verificación de paleta personalizada en Tailwind v3.
      </p>

      <div class="flex flex-wrap gap-2 justify-center">
        <span class="px-3 py-1 bg-peach text-slate font-semibold text-xs rounded-full border border-slate">
          peach: Síntoma
        </span>
        <span class="px-3 py-1 bg-mint text-slate font-semibold text-xs rounded-full border border-slate">
          mint: Confirmado
        </span>
        <span class="px-3 py-1 bg-sky text-slate font-semibold text-xs rounded-full border border-slate">
          sky: Info
        </span>
      </div>
    </div>
  </main>
</template>