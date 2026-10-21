<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isLight, toggle } = useTheme()
</script>

<template>
  <button
      class="toggle"
      type="button"
      :aria-label="isLight ? 'Switch to dark mode' : 'Switch to light mode'"
      :title="isLight ? 'Switch to dark mode' : 'Switch to light mode'"
      @click="toggle"
  >
    <Transition name="swap" mode="out-in">
      <!-- light mode is on: show the moon (click = go dark) -->
      <svg v-if="isLight" key="moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>

      <!-- dark mode is on: show the sun (click = go light) -->
      <svg v-else key="sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.toggle {
  width: 42px; height: 42px; display: grid; place-items: center; flex-shrink: 0;
  background: none; color: var(--teal); cursor: pointer;
  border: 1px solid var(--line); border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
}
.toggle:hover {
  border-color: var(--teal);
  box-shadow: 0 0 14px rgba(0, 245, 212, 0.3);
}

svg {
  width: 20px; height: 20px;
  fill: none; stroke: currentColor; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}

.swap-enter-active, .swap-leave-active { transition: transform 0.22s ease, opacity 0.22s ease; }
.swap-enter-from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
.swap-leave-to { transform: rotate(90deg) scale(0.5); opacity: 0; }
</style>