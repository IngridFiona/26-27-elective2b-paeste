<script setup lang="ts">
import { useHud } from '@/composables/useHud'

const { scroll, fps, clock } = useHud()
</script>

<template>
  <div class="progress" :style="{ width: scroll + '%' }" />
  <aside class="hud glass" aria-hidden="true">
    <span class="dot" />SYS <b>ONLINE</b><br>
    SCROLL <b>{{ scroll }}%</b> · FPS <b>{{ fps }}</b><br>
    <b>{{ clock }}</b>
  </aside>
</template>

<style scoped>
.progress {
  position: fixed; top: 0; left: 0; height: 2px; z-index: 30;
  background: linear-gradient(90deg, var(--teal), var(--mag));
  box-shadow: 0 0 10px var(--teal);
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
@keyframes pulse { 50% { opacity: 0.25; } }
</style>