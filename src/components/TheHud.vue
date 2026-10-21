<script setup lang="ts">
import { useHud } from '@/composables/useHud'

const { scroll, fps, clock } = useHud()
</script>

<template>
  <!-- faint line across the top, the colored part fills in as you scroll -->
  <div class="track" aria-hidden="true" />
  <div class="progress" :style="{ width: scroll + '%' }" aria-hidden="true" />

  <aside class="hud glass" aria-hidden="true">
    <span class="dot" />SYS <b>ONLINE</b><br>
    SCROLL <b>{{ scroll }}%</b> · FPS <b>{{ fps }}</b><br>
    <b>{{ clock }}</b>
  </aside>
</template>

<style scoped>
.track {
  position: fixed; top: 0; left: 0; right: 0; height: 4px; z-index: 29;
  background: var(--line);
  opacity: 0.6;
}

.progress {
  position: fixed; top: 0; left: 0; height: 4px; z-index: 30;
  border-radius: 0 4px 4px 0;
  /* the colors slowly flow along the bar */
  background: linear-gradient(90deg, var(--teal), var(--mag), var(--teal));
  background-size: 200% 100%;
  animation: flow 3s linear infinite;
  box-shadow: 0 0 12px var(--teal);
  transition: width 0.12s linear;
}

.hud {
  position: fixed; right: 14px; bottom: 14px; z-index: 15;
  padding: 9px 12px; text-align: right;
  font: 0.7rem/1.5 var(--mono); color: var(--mute);
}
.hud b { color: var(--teal); font-weight: 600; }
.dot {
  display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%;
  background: var(--teal); box-shadow: 0 0 10px var(--teal);
  animation: pulse 1.6s infinite;
}

@keyframes flow { to { background-position: -200% 0; } }
@keyframes pulse { 50% { opacity: 0.25; } }
</style>