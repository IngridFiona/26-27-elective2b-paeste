<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Skill } from '@/types'

const props = defineProps<{ skills: Skill[]; active: boolean }>()

const R = 100
const k = ref(0)

const pt = (i: number, v: number): [number, number] => {
  const a = (i / props.skills.length) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(a) * R * v, Math.sin(a) * R * v]
}

const ring = (l: number) => props.skills.map((_, i) => pt(i, l).join(',')).join(' ')

const shape = computed(() =>
    props.skills.map((s, i) => pt(i, (s.level / 100) * k.value).join(',')).join(' '),
)

const dots = computed(() =>
    props.skills.map((s, i) => pt(i, (s.level / 100) * k.value)),
)

watch(() => props.active, (on) => {
  if (!on) return
  const t0 = performance.now()
  const step = (t: number) => {
    const p = Math.min((t - t0) / 1400, 1)
    k.value = 1 - (1 - p) ** 3
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
})
</script>

<template>
  <svg viewBox="-130 -130 260 260" role="img" aria-label="Skill radar chart" class="radar">
    <polygon
        v-for="l in [0.25, 0.5, 0.75, 1]" :key="l"
        :points="ring(l)" fill="none" stroke="rgba(0,245,212,.2)"
    />
    <g v-for="(s, i) in skills" :key="s.name">
      <line x1="0" y1="0" :x2="pt(i, 1)[0]" :y2="pt(i, 1)[1]" stroke="rgba(0,245,212,.2)" />
      <text
          :x="pt(i, 1.22)[0]" :y="pt(i, 1.22)[1]"
          fill="#7fa4a4" font-size="8.5" text-anchor="middle" dominant-baseline="middle"
          font-family="ui-monospace, monospace"
      >{{ s.name }}</text>
    </g>
    <polygon
        :points="shape" fill="rgba(0,245,212,.25)" stroke="#00f5d4" stroke-width="2"
        style="filter: drop-shadow(0 0 6px #00f5d4)"
    />
    <circle v-for="(d, i) in dots" :key="i" :cx="d[0]" :cy="d[1]" r="3.5" fill="#ff2e97" />
  </svg>
</template>

<style scoped>
.radar { width: 100%; max-width: 400px; margin: auto; display: block; overflow: visible; }
</style>