<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data'

const emit = defineEmits<{ done: [] }>()

/* ---------- Edit these ---------- */
const subtitle = 'COMPUTER ENGINEERING // PORTFOLIO v1.0'
const steps = [
  { at: 8, text: 'Initializing portfolio.sys' },
  { at: 30, text: 'Loading profile photo' },
  { at: 55, text: 'Mounting certificates' },
  { at: 78, text: 'Linking social profiles' },
  { at: 100, text: 'Starting interface' },
]

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = reduce ? 500 : 3400   // total loading time in ms
const EXIT_MS = reduce ? 0 : 650       // length of the shutdown animation

/* ---------- State ---------- */
const progress = ref(0)
const shown = ref(0)
const ready = ref(false)
const leaving = ref(false)

const title = profile.name.toUpperCase()
const display = ref(title.replace(/[^ ]/g, '0'))

const percent = computed(() => Math.floor(progress.value))
const hex = computed(() =>
    Math.floor((progress.value / 100) * 65535).toString(16).toUpperCase().padStart(4, '0'),
)

/* ---------- Reactor ring geometry ---------- */
const TICKS = 72
const ticks = Array.from({ length: TICKS }, (_, i) => {
  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2
  const long = i % 6 === 0
  const r1 = long ? 85 : 90
  const r2 = 97
  return {
    x1: 100 + Math.cos(a) * r1,
    y1: 100 + Math.sin(a) * r1,
    x2: 100 + Math.cos(a) * r2,
    y2: 100 + Math.sin(a) * r2,
    long,
  }
})
const lit = computed(() => Math.floor((progress.value / 100) * TICKS))

const ARC_R = 74
const C = 2 * Math.PI * ARC_R
const offset = computed(() => C * (1 - progress.value / 100))

/* ---------- Name decoder ---------- */
const GLYPHS = '01<>/\\{}[]#$%&*+=?;:'
function scramble(target: string, p: number): string {
  const n = Math.floor(target.length * p)
  let out = ''
  for (let i = 0; i < target.length; i++) {
    const ch = target.charAt(i)
    out += ch === ' ' || i < n ? ch : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))
  }
  return out
}

/* ---------- Code rain background ---------- */
const rain = ref<HTMLCanvasElement | null>(null)
const FS = 16
let drops: number[] = []
let rW = 0
let rH = 0
let lastRain = 0

function setupRain() {
  const c = rain.value
  if (!c) return
  rW = c.width = innerWidth
  rH = c.height = innerHeight
  drops = Array.from({ length: Math.ceil(rW / FS) }, () => Math.random() * -50)
  c.getContext('2d')?.clearRect(0, 0, rW, rH)
}

function drawRain(t: number) {
  if (t - lastRain < 45) return
  lastRain = t
  const ctx = rain.value?.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'rgba(4, 9, 12, 0.14)'
  ctx.fillRect(0, 0, rW, rH)
  ctx.font = `${FS}px ui-monospace, Menlo, Consolas, monospace`

  for (let i = 0; i < drops.length; i++) {
    const y = drops[i] ?? 0
    ctx.fillStyle = Math.random() > 0.975 ? '#ff2e97' : '#00f5d4'
    ctx.fillText(GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)), i * FS, y * FS)
    drops[i] = y * FS > rH && Math.random() > 0.975 ? 0 : y + 1
  }
}

/* ---------- Main loop ---------- */
let raf = 0
let last = 0
let frames = 0
let exitTimer = 0

function frame(t: number) {
  if (!last) last = t
  const dt = t - last
  last = t
  frames++

  if (!ready.value) {
    progress.value = Math.min(100, progress.value + (dt / duration) * 100)

    while (shown.value < steps.length && progress.value >= (steps[shown.value]?.at ?? Infinity)) {
      shown.value++
    }

    // the name locks in a little before 100%
    if (frames % 2 === 0) {
      display.value = scramble(title, Math.min(1, progress.value / 85))
    }

    if (progress.value >= 100) complete()
  }

  if (!reduce) drawRain(t)
  raf = requestAnimationFrame(frame)
}

function complete() {
  progress.value = 100
  shown.value = steps.length
  display.value = title
  ready.value = true
}

function proceed() {
  if (leaving.value) return
  if (!ready.value) {
    complete()
    return
  }
  leaving.value = true
  exitTimer = window.setTimeout(() => emit('done'), EXIT_MS)
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  proceed()
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  setupRain()
  addEventListener('keydown', onKey)
  addEventListener('resize', setupRain)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(exitTimer)
  removeEventListener('keydown', onKey)
  removeEventListener('resize', setupRain)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
      class="boot"
      :class="{ ready, leaving }"
      role="progressbar"
      aria-label="Loading portfolio"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      @click="proceed"
  >
    <canvas ref="rain" class="rain" aria-hidden="true" />
    <div class="sweep" aria-hidden="true"></div>

    <span class="corner tl" aria-hidden="true" />
    <span class="corner tr" aria-hidden="true" />
    <span class="corner bl" aria-hidden="true" />
    <span class="corner br" aria-hidden="true" />
    <p class="hud hud-tl" aria-hidden="true">BOOT SEQUENCE<br>CSU-CARIG // CpE</p>
    <p class="hud hud-br" aria-hidden="true">MEM 0x{{ hex }}<br>{{ ready ? 'STATUS: READY' : 'STATUS: LOADING' }}</p>

    <div class="box">
      <!-- reactor ring: ticks light up as the load progresses -->
      <div class="reactor" aria-hidden="true">
        <span class="shock" />
        <svg viewBox="0 0 200 200">
          <line
              v-for="(t, i) in ticks"
              :key="i"
              :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
              class="tick"
              :class="{ long: t.long, on: i < lit }"
          />
          <circle class="orbit" cx="100" cy="100" r="64" />
          <circle class="track" cx="100" cy="100" :r="ARC_R" />
          <circle
              class="arc" cx="100" cy="100" :r="ARC_R"
              :stroke-dasharray="C" :stroke-dashoffset="offset"
              transform="rotate(-90 100 100)"
          />
        </svg>
        <div class="radar" />
        <div class="center">
          <span class="num">{{ percent }}</span><span class="pc">%</span>
        </div>
      </div>

      <h1 class="name glitch" :data-text="display">{{ display }}</h1>
      <p class="sub">{{ subtitle }}</p>

      <ul class="log" aria-live="polite">
        <li v-for="(s, i) in steps" :key="s.text" :class="{ show: i <= shown }">
          <span v-if="i < shown" class="ok">[ OK ]</span>
          <span v-else class="wait">[ .. ]</span>
          {{ s.text }}
        </li>
      </ul>

      <p class="granted" :class="{ show: ready }">ACCESS GRANTED</p>
      <p class="press" :class="{ show: ready }">
        Press any key to continue<span class="cursor" />
      </p>
      <p class="tap" :class="{ show: ready }">(or tap the screen)</p>
    </div>

    <div class="flash" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.boot {
  /* the boot screen is always dark, even when the site is in light mode */
  --bg: #04090c;
  --ink: #d8f3f0;
  --mute: #7fa4a4;
  --teal: #00f5d4;
  --mag: #ff2e97;

  position: fixed; inset: 0; z-index: 100; overflow: hidden;
  display: grid; place-items: center; padding: 24px;
  background: var(--bg); cursor: pointer; text-align: center;
}

/* ---------- background layers ---------- */
.rain {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0.4; z-index: 0; pointer-events: none;
  /* keep the middle calm so the text stays readable */
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, transparent 12%, #000 80%);
  mask-image: radial-gradient(ellipse at 50% 50%, transparent 12%, #000 80%);
}

/* scanlines + glow + vignette */
.boot::before {
  content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
      repeating-linear-gradient(0deg, rgba(0, 245, 212, 0.05) 0 1px, transparent 1px 3px),
      radial-gradient(circle at 50% 38%, rgba(0, 245, 212, 0.13), transparent 60%),
      radial-gradient(circle at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.6) 100%);
}

/* moving scan bar */
.sweep {
  position: absolute; left: 0; right: 0; height: 120px; top: -120px; z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(0, 245, 212, 0.08), transparent);
  animation: sweep 4.5s linear infinite;
}

/* HUD corners + readouts */
.corner {
  position: absolute; width: 26px; height: 26px; z-index: 2; pointer-events: none;
  border: 2px solid var(--teal); opacity: 0.65;
  filter: drop-shadow(0 0 6px var(--teal));
}
.tl { top: 18px; left: 18px; border-right: 0; border-bottom: 0; }
.tr { top: 18px; right: 18px; border-left: 0; border-bottom: 0; }
.bl { bottom: 18px; left: 18px; border-right: 0; border-top: 0; }
.br { bottom: 18px; right: 18px; border-left: 0; border-top: 0; }

.hud {
  position: absolute; z-index: 2; margin: 0; pointer-events: none;
  font: 0.68rem/1.6 var(--mono); letter-spacing: 0.08em; color: var(--mute);
}
.hud-tl { top: 54px; left: 22px; text-align: left; }
.hud-br { bottom: 54px; right: 22px; text-align: right; }
.boot.ready .hud-br { color: var(--teal); }

.box { position: relative; z-index: 2; width: min(620px, 100%); animation: flicker 6s infinite; }

/* ---------- reactor ---------- */
.reactor {
  position: relative; width: min(250px, 58vw); aspect-ratio: 1; margin: 0 auto 26px;
  filter: drop-shadow(0 0 18px rgba(0, 245, 212, 0.25));
}
.reactor svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

.tick { stroke: rgba(0, 245, 212, 0.18); stroke-width: 1.4; stroke-linecap: round; transition: stroke 0.15s; }
.tick.long { stroke-width: 2.2; }
.tick.on { stroke: var(--teal); filter: drop-shadow(0 0 3px var(--teal)); }
.boot.ready .tick.on { stroke: var(--mag); filter: drop-shadow(0 0 3px var(--mag)); }

.orbit {
  fill: none; stroke: rgba(255, 46, 151, 0.55); stroke-width: 1.2; stroke-dasharray: 3 9;
  transform-box: fill-box; transform-origin: center;
  animation: spin 16s linear infinite reverse;
}
.track { fill: none; stroke: rgba(0, 245, 212, 0.12); stroke-width: 3; }
.arc {
  fill: none; stroke: var(--teal); stroke-width: 3; stroke-linecap: round;
  filter: drop-shadow(0 0 5px var(--teal));
}
.boot.ready .arc { stroke: var(--mag); filter: drop-shadow(0 0 6px var(--mag)); }

.radar {
  position: absolute; inset: 19%; border-radius: 50%;
  border: 1px solid rgba(0, 245, 212, 0.25);
  background: conic-gradient(from 0deg, transparent 0deg 215deg, rgba(0, 245, 212, 0.34) 360deg);
  animation: spin 2.2s linear infinite;
}
.boot.ready .radar { animation-play-state: paused; opacity: 0.35; }

.center {
  position: absolute; inset: 0; display: flex; align-items: baseline; justify-content: center;
  padding-top: 33%;
  font-family: var(--mono); color: var(--ink);
}
.num { font-size: clamp(2.2rem, 9vw, 3.1rem); font-weight: 800; text-shadow: 0 0 18px rgba(0, 245, 212, 0.7); }
.pc { font-size: 1rem; margin-left: 2px; color: var(--teal); }
.boot.ready .num { color: var(--mag); text-shadow: 0 0 20px rgba(255, 46, 151, 0.8); }

/* shockwave when loading finishes */
.shock {
  position: absolute; inset: 4%; border-radius: 50%; border: 2px solid var(--mag);
  opacity: 0; pointer-events: none;
}
.boot.ready .shock { animation: shock 1.6s ease-out infinite; }

/* ---------- glitch text (teal + pink split layers) ---------- */
.glitch { position: relative; display: inline-block; }
.glitch::before, .glitch::after {
  content: attr(data-text);
  position: absolute; inset: 0; pointer-events: none;
}
.glitch::before {
  color: var(--teal); transform: translate(-3px, 0);
  clip-path: inset(0 0 60% 0); animation: glitch-a 3.2s steps(1) infinite;
}
.glitch::after {
  color: var(--mag); transform: translate(3px, 0);
  clip-path: inset(55% 0 0 0); animation: glitch-b 2.7s steps(1) infinite;
}

.name {
  font: 800 clamp(1.25rem, 4.6vw, 2.3rem) var(--mono);
  letter-spacing: 0.04em; color: var(--ink); white-space: nowrap;
  text-shadow: 0 0 24px rgba(0, 245, 212, 0.4);
}
.sub { margin: 12px 0 24px; font: 0.8rem var(--mono); letter-spacing: 0.1em; color: var(--mute); }

/* ---------- log ---------- */
.log {
  display: inline-block; margin: 0 0 22px; padding: 0; list-style: none;
  text-align: left; font: 0.9rem/1.85 var(--mono); color: var(--mute);
}
.log li { opacity: 0; transform: translateX(-10px); transition: opacity 0.2s, transform 0.2s; }
.log li.show { opacity: 1; transform: none; }
.ok { color: var(--teal); font-weight: 700; margin-right: 6px; text-shadow: 0 0 10px rgba(0, 245, 212, 0.7); }
.wait { color: var(--mag); font-weight: 700; margin-right: 6px; animation: blink 0.6s steps(1) infinite; }

/* ---------- call to action ---------- */
.granted, .press, .tap { opacity: 0; transition: opacity 0.4s; margin: 0; }
.granted.show, .press.show, .tap.show { opacity: 1; }
.granted {
  margin-bottom: 10px; font: 800 0.95rem var(--mono); letter-spacing: 0.35em;
  color: var(--teal); text-shadow: 0 0 14px rgba(0, 245, 212, 0.7);
}
.press { font: 700 1.1rem var(--mono); color: var(--mag); text-shadow: 0 0 14px rgba(255, 46, 151, 0.6); }
.boot.ready .press { animation: pulse 1.6s ease-in-out infinite; }
.tap { margin-top: 10px; font: 0.78rem var(--mono); color: var(--mute); }

.cursor {
  display: inline-block; width: 11px; height: 1.05em; margin-left: 10px;
  vertical-align: text-bottom; background: var(--mag);
  animation: blink 1s steps(1) infinite;
}

/* ---------- exit: flash, then the screen collapses like an old CRT ---------- */
.flash {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: #d8fffa; opacity: 0;
}
.boot.leaving { pointer-events: none; animation: crt-off 0.65s cubic-bezier(0.7, 0, 0.3, 1) forwards; }
.boot.leaving .flash { animation: flash 0.65s ease-in forwards; }

/* ---------- keyframes ---------- */
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse { 50% { opacity: 0.6; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes sweep { to { transform: translateY(calc(100vh + 240px)); } }
@keyframes shock {
  0% { opacity: 0.8; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(1.5); }
}

@keyframes flicker {
  0%, 94%, 100% { opacity: 1; }
  95% { opacity: 0.86; }
  96% { opacity: 1; }
  97% { opacity: 0.9; }
}

@keyframes glitch-a {
  0%, 82%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
  84% { clip-path: inset(10% 0 55% 0); transform: translate(-5px, -1px); }
  88% { clip-path: inset(40% 0 30% 0); transform: translate(4px, 1px); }
  92% { clip-path: inset(0 0 70% 0); transform: translate(-3px, 0); }
}
@keyframes glitch-b {
  0%, 78%, 100% { clip-path: inset(100% 0 0 0); transform: translate(0); }
  80% { clip-path: inset(60% 0 8% 0); transform: translate(5px, 1px); }
  86% { clip-path: inset(25% 0 50% 0); transform: translate(-4px, -1px); }
  90% { clip-path: inset(70% 0 0 0); transform: translate(3px, 0); }
}

@keyframes flash {
  0% { opacity: 0; }
  40%, 100% { opacity: 1; }
}
@keyframes crt-off {
  0%, 40% { transform: scale(1, 1); opacity: 1; }
  70% { transform: scale(1, 0.008); opacity: 1; }
  100% { transform: scale(0, 0.008); opacity: 0; }
}

@media (max-width: 520px) {
  .hud { display: none; }
  .log { font-size: 0.8rem; }
  .sub { font-size: 0.7rem; }
}

@media (max-height: 720px) {
  .reactor { width: min(170px, 34vh); margin-bottom: 16px; }
  .log { margin-bottom: 14px; line-height: 1.6; }
  .sub { margin-bottom: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .box, .sweep, .radar, .orbit, .shock, .glitch::before, .glitch::after,
  .boot.ready .press, .wait, .cursor, .boot.leaving, .boot.leaving .flash { animation: none; }
  .glitch::before, .glitch::after, .rain { display: none; }
}
</style>