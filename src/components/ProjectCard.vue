<script setup lang="ts">
import { computed } from 'vue'
import { vTilt } from '@/directives/tilt'
import type { Project } from '@/types'

defineProps<{ project: Project }>()

function seeded(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const cells = computed(() => {
  const r = seeded(7)
  const out: { x: number; y: number; hot: boolean; o: string }[] = []
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 14; x++) {
      const v = r()
      out.push({ x: 10 + x * 20, y: 12 + y * 18, hot: v > 0.82, o: (0.12 + v * 0.8).toFixed(2) })
    }
  }
  return out
})

const lines = computed(() => {
  const r = seeded(11)
  return Array.from({ length: 8 }, (_, i) => ({
    y: 14 + i * 14,
    w: 70 + r() * 130,
    o: (0.25 + r() * 0.5).toFixed(2),
  }))
})
</script>

<template>
  <article v-tilt class="card glass">
    <div class="shot">
      <svg viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <template v-if="project.art === 'heatmap'">
          <rect
              v-for="(c, i) in cells" :key="i"
              :x="c.x" :y="c.y" width="16" height="14" rx="2"
              :fill="c.hot ? '#ff2e97' : '#00f5d4'" :opacity="c.o"
          />
        </template>

        <template v-else-if="project.art === 'components'">
          <rect x="14" y="14" width="130" height="74" rx="8" fill="none" stroke="#00f5d4" opacity=".7" />
          <rect x="26" y="28" width="70" height="7" rx="3" fill="#00f5d4" opacity=".8" />
          <rect x="26" y="44" width="98" height="5" rx="2" fill="#7fa4a4" opacity=".5" />
          <rect x="26" y="56" width="84" height="5" rx="2" fill="#7fa4a4" opacity=".5" />
          <rect x="26" y="68" width="46" height="14" rx="5" fill="#ff2e97" />
          <rect x="160" y="14" width="126" height="34" rx="8" fill="#00f5d4" fill-opacity=".15" stroke="#00f5d4" />
          <rect x="254" y="25" width="26" height="12" rx="6" fill="#00f5d4" />
          <circle cx="274" cy="31" r="4" fill="#022" />
          <rect x="160" y="58" width="126" height="30" rx="8" fill="none" stroke="#ff2e97" opacity=".7" />
          <rect x="14" y="98" width="272" height="20" rx="6" fill="#00f5d4" opacity=".1" />
        </template>

        <template v-else>
          <rect
              v-for="(l, i) in lines" :key="i"
              x="16" :y="l.y" :width="l.w" height="6" rx="3" fill="#00f5d4" :opacity="l.o"
          />
          <g transform="translate(236 66)" fill="none" stroke="#ff2e97" stroke-width="4">
            <rect x="-22" y="-4" width="44" height="34" rx="6" fill="#ff2e97" fill-opacity=".2" />
            <path d="M-12 -4v-12a12 12 0 0124 0v12" />
          </g>
        </template>
      </svg>
    </div>

    <h3>{{ project.title }}</h3>
    <p>{{ project.blurb }}</p>
    <span v-for="t in project.tags" :key="t" class="chip">{{ t }}</span>
  </article>
</template>

<style scoped>
.card {
  position: relative; padding: 24px; overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out, border-color 0.2s;
  --mx: 50%; --my: 50%;
}
.card::before {
  content: ''; position: absolute; inset: 0; opacity: 0; pointer-events: none;
  background: radial-gradient(260px circle at var(--mx) var(--my), rgba(0, 245, 212, 0.2), transparent 65%);
  transition: opacity 0.25s;
}
.card:hover { border-color: var(--teal); }
.card:hover::before { opacity: 1; }

.shot {
  position: relative; height: 140px; margin: -24px -24px 18px;
  background: #06151a; border-bottom: 1px solid var(--line);
}
.shot svg { width: 100%; height: 100%; display: block; }
.shot::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 245, 212, 0.07) 0 1px, transparent 1px 3px);
}

h3 { font-size: 1.15rem; margin-bottom: 10px; }
p { color: var(--mute); margin: 0 0 14px; }
.chip {
  display: inline-block; margin: 0 6px 6px 0; padding: 2px 8px;
  font: 0.72rem var(--mono); color: var(--teal);
  border: 1px solid var(--line); border-radius: 6px;
}
</style>