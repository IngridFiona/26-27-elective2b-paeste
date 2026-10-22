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

/* pins of the chip artwork */
const pins = Array.from({ length: 6 }, (_, i) => ({ y: 38 + i * 11 }))
</script>

<template>
  <article v-tilt class="card glass">
    <!-- decorative banner (delete this whole div if you want text only) -->
    <div class="shot">
      <!-- status badge: only shows when the project has a status -->
      <span v-if="project.status" class="badge" :class="project.status">
        {{ project.status === 'completed' ? 'Completed' : 'In Progress' }}
      </span>

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

        <template v-else-if="project.art === 'circuit'">
          <g fill="none" stroke="#00f5d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".85">
            <!-- top rail: resistor then capacitor -->
            <path d="M14 36 H58 L64 20 L76 52 L88 20 L100 52 L112 20 L118 36 H176" />
            <path d="M176 20 V52 M184 20 V52 M184 36 H286" />
            <!-- bottom rail: diode -->
            <path d="M14 100 H120 M150 100 H286" />
            <path d="M152 88 V112" />
            <!-- side wires -->
            <path d="M14 36 V100 M286 36 V100" />
          </g>
          <path d="M120 88 L150 100 L120 112 Z" fill="#ff2e97" fill-opacity=".3" stroke="#ff2e97" stroke-width="2" stroke-linejoin="round" />
          <circle cx="14" cy="36" r="3.5" fill="#ff2e97" />
          <circle cx="286" cy="36" r="3.5" fill="#ff2e97" />
          <circle cx="14" cy="100" r="3.5" fill="#ff2e97" />
          <circle cx="286" cy="100" r="3.5" fill="#ff2e97" />
          <rect x="196" y="62" width="76" height="24" rx="5" fill="#00f5d4" fill-opacity=".1" stroke="#00f5d4" opacity=".6" />
        </template>

        <template v-else-if="project.art === 'chip'">
          <g stroke-linecap="round">
            <template v-for="(pin, i) in pins" :key="i">
              <!-- left pin + trace -->
              <rect x="90" :y="pin.y - 2.5" width="14" height="5" rx="1" fill="#00f5d4" opacity=".8" />
              <path :d="`M90 ${pin.y} H${50 - i * 6}`" fill="none" stroke="#00f5d4" stroke-width="1.5" opacity=".5" />
              <circle :cx="50 - i * 6" :cy="pin.y" r="2.5" fill="#00f5d4" opacity=".7" />
              <!-- right pin + trace -->
              <rect x="196" :y="pin.y - 2.5" width="14" height="5" rx="1" fill="#00f5d4" opacity=".8" />
              <path :d="`M210 ${pin.y} H${250 + i * 6}`" fill="none" stroke="#ff2e97" stroke-width="1.5" opacity=".55" />
              <circle :cx="250 + i * 6" :cy="pin.y" r="2.5" fill="#ff2e97" opacity=".8" />
            </template>
          </g>
          <rect x="104" y="28" width="92" height="74" rx="6" fill="#00f5d4" fill-opacity=".12" stroke="#00f5d4" stroke-width="2" />
          <circle cx="117" cy="41" r="4" fill="none" stroke="#ff2e97" stroke-width="2" />
          <rect x="128" y="58" width="52" height="5" rx="2" fill="#00f5d4" opacity=".8" />
          <rect x="128" y="70" width="36" height="5" rx="2" fill="#7fa4a4" opacity=".6" />
          <rect x="128" y="82" width="44" height="5" rx="2" fill="#7fa4a4" opacity=".4" />
        </template>

        <template v-else-if="project.art === 'helmet'">
          <!-- warning sound waves -->
          <path d="M54 58 Q42 70 54 82 M42 48 Q22 70 42 92" fill="none" stroke="#ff2e97" stroke-width="2" stroke-linecap="round" opacity=".7" />
          <!-- helmet -->
          <path d="M70 92 V82 Q70 36 116 36 Q162 36 162 82 V92 Z" fill="#00f5d4" fill-opacity=".14" stroke="#00f5d4" stroke-width="2" stroke-linejoin="round" />
          <path d="M62 92 H176" stroke="#00f5d4" stroke-width="3" stroke-linecap="round" />
          <path d="M116 36 V60" stroke="#00f5d4" stroke-width="2" opacity=".5" />
          <!-- camera -->
          <circle cx="152" cy="68" r="7" fill="#06151a" stroke="#ff2e97" stroke-width="2" />
          <circle cx="152" cy="68" r="2.5" fill="#ff2e97" />
          <!-- scan rays -->
          <path d="M160 68 L222 46 M160 68 L222 90" fill="none" stroke="#ff2e97" stroke-dasharray="3 4" opacity=".6" />
          <!-- detection box around an obstacle -->
          <rect x="222" y="36" width="64" height="64" rx="3" fill="#ff2e97" fill-opacity=".08" stroke="#ff2e97" stroke-width="1.5" />
          <rect x="222" y="25" width="40" height="11" rx="2" fill="#ff2e97" />
          <circle cx="254" cy="56" r="8" fill="#00f5d4" opacity=".7" />
          <rect x="244" y="66" width="20" height="26" rx="6" fill="#00f5d4" opacity=".55" />
        </template>

        <template v-else-if="project.art === 'house'">
          <!-- house raised on stilts -->
          <path d="M100 48 L150 14 L200 48 Z" fill="#00f5d4" fill-opacity=".14" stroke="#00f5d4" stroke-width="2" stroke-linejoin="round" />
          <rect x="110" y="48" width="80" height="40" fill="#00f5d4" fill-opacity=".1" stroke="#00f5d4" stroke-width="2" />
          <rect x="140" y="62" width="20" height="26" rx="2" fill="#00f5d4" opacity=".5" />
          <rect x="118" y="58" width="14" height="12" rx="1" fill="none" stroke="#00f5d4" opacity=".7" />
          <rect x="168" y="58" width="14" height="12" rx="1" fill="none" stroke="#00f5d4" opacity=".7" />
          <path d="M116 88 V124 M150 88 V124 M184 88 V124" stroke="#00f5d4" stroke-width="3" stroke-linecap="round" opacity=".8" />
          <!-- water sensor -->
          <circle cx="150" cy="14" r="4" fill="#ff2e97" />
          <circle cx="150" cy="14" r="9" fill="none" stroke="#ff2e97" opacity=".5" />
          <!-- flood water -->
          <path
              d="M0 102 Q12 94 24 102 T48 102 T72 102 T96 102 T120 102 T144 102 T168 102 T192 102 T216 102 T240 102 T264 102 T288 102 T312 102 V130 H0 Z"
              fill="#00f5d4" fill-opacity=".14"
          />
          <path
              d="M0 102 Q12 94 24 102 T48 102 T72 102 T96 102 T120 102 T144 102 T168 102 T192 102 T216 102 T240 102 T264 102 T288 102 T312 102"
              fill="none" stroke="#00f5d4" stroke-width="2.5" stroke-linecap="round"
          />
          <path d="M0 114 Q12 106 24 114 T48 114 T72 114 T96 114 T120 114 T144 114 T168 114 T192 114 T216 114 T240 114 T264 114 T288 114 T312 114" fill="none" stroke="#ff2e97" stroke-width="1.5" opacity=".5" />
        </template>

        <template v-else-if="project.art === 'sensor'">
          <!-- grid -->
          <g stroke="#00f5d4" opacity=".12">
            <path d="M0 30 H300 M0 65 H300 M0 100 H300" />
            <path d="M50 0 V130 M100 0 V130 M150 0 V130 M200 0 V130 M250 0 V130" />
          </g>
          <!-- alarm threshold -->
          <path d="M10 38 H290" stroke="#ff2e97" stroke-width="1.5" stroke-dasharray="5 5" opacity=".8" />
          <!-- signal wave -->
          <path
              d="M10 82 Q30 28 50 82 T90 82 T130 82 T170 82 T210 82 T250 82 T290 82"
              fill="none" stroke="#00f5d4" stroke-width="2.5" stroke-linecap="round"
          />
          <!-- gas particles -->
          <circle cx="236" cy="22" r="5" fill="none" stroke="#ff2e97" opacity=".8" />
          <circle cx="252" cy="14" r="3" fill="none" stroke="#ff2e97" opacity=".6" />
          <circle cx="266" cy="26" r="4" fill="none" stroke="#ff2e97" opacity=".7" />
          <circle cx="50" cy="38" r="4.5" fill="#ff2e97" />
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

    <dl class="info">
      <div>
        <dt>School Year</dt>
        <dd>{{ project.schoolYear }}</dd>
      </div>
      <!-- only shows when the project has a semester -->
      <div v-if="project.semester">
        <dt>Semester</dt>
        <dd>{{ project.semester }}</dd>
      </div>
      <div class="wide">
        <dt>Course Subject</dt>
        <dd>{{ project.subject }}</dd>
      </div>
      <!-- only shows when the project has a team list -->
      <div v-if="project.team?.length" class="wide">
        <dt>Team</dt>
        <dd class="team">
          <span v-for="m in project.team" :key="m">{{ m }}</span>
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.card {
  position: relative; padding: 24px; overflow: hidden; height: 100%;
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

/* status badge (sits on the dark banner, so it uses fixed colors in both themes) */
.badge {
  position: absolute; top: 10px; right: 10px; z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  font: 600 0.7rem var(--mono); padding: 4px 10px; border-radius: 99px;
  background: rgba(4, 9, 12, 0.78); border: 1px solid;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.badge::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.badge.completed { color: #00f5d4; border-color: rgba(0, 245, 212, 0.6); }
.badge.in-progress { color: #ff2e97; border-color: rgba(255, 46, 151, 0.6); }
.badge.in-progress::before { animation: blink 1.4s ease-in-out infinite; }
@keyframes blink { 50% { opacity: 0.25; } }

h3 { font-size: 1.15rem; margin-bottom: 16px; }

.info { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.info .wide { grid-column: 1 / -1; }
.info dt { font: 0.72rem var(--mono); color: var(--mute); margin-bottom: 2px; }
.info dd { margin: 0; font: 600 0.95rem var(--mono); color: var(--teal); }

/* team names: 2 per row */
.team { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.team span {
  font: 0.75rem var(--mono); color: var(--ink); overflow-wrap: anywhere;
  padding: 4px 10px; border-radius: 8px;
  background: rgba(0, 245, 212, 0.07); border: 1px solid var(--line);
}
</style>