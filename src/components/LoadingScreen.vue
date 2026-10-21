<script setup lang="ts">
/*
HYPERSPACE BOOT SCREEN  (drop-in replacement for LoadingScreen.vue)

What happens:
  1. You fly through a 3D starfield that speeds up as loading progresses.
  2. A holographic reactor (spinning rings + a glowing progress arc) fills up.
  3. Your name decodes out of random symbols while a boot log types itself.
  4. At 100% the ship settles down: "ACCESS GRANTED" + a LAUNCH button.
  5. Press any key / click / tap -> HYPERJUMP: the stars stretch into
     streaks, the screen shockwaves, and your portfolio appears.

It always stays dark (even in light mode) and respects "reduce motion".
Same as before: emits `done` when finished, uses `profile` from '@/data'.
*/
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data'

const emit = defineEmits<{ done: [] }>()

/* ---------- Edit these ---------- */
const subtitle = 'COMPUTER ENGINEERING // PORTFOLIO v2.0'
const steps = [
  { at: 8, text: 'Initializing portfolio.sys' },
  { at: 30, text: 'Loading profile photo' },
  { at: 55, text: 'Mounting certificates' },
  { at: 78, text: 'Linking social profiles' },
  { at: 100, text: 'Starting interface' },
]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = reduce ? 500 : 3800 // total loading time in ms
const EXIT_MS = reduce ? 0 : 900 // length of the hyperjump
const STAR_COUNT = 320 // more = denser warp tunnel

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
const status = computed(() =>
    leaving.value ? 'STATUS: HYPERJUMP' : ready.value ? 'STATUS: READY' : 'STATUS: LOADING',
)

/* ---------- Reactor ring geometry ---------- */
const TICKS = 90
const ticks = Array.from({ length: TICKS }, (_, i) => {
  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2
  const long = i % 5 === 0
  const r1 = long ? 99 : 102
  const r2 = 108
  return {
    x1: 120 + Math.cos(a) * r1,
    y1: 120 + Math.sin(a) * r1,
    x2: 120 + Math.cos(a) * r2,
    y2: 120 + Math.sin(a) * r2,
    long,
  }
})
const lit = computed(() => Math.floor((progress.value / 100) * TICKS))
const ARC_R = 82
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

/* ---------- Hyperspace starfield ---------- */
interface Star { x: number; y: number; z: number; hue: 0 | 1 | 2 }
const warp = ref<HTMLCanvasElement | null>(null)
const bootEl = ref<HTMLElement | null>(null)
const Z = 1000
let stars: Star[] = []
let W = 0
let H = 0
let dpr = 1
let speed = 120 // current speed (units / second)
let exitStart = 0

function newStar(far = false): Star {
  const r = Math.random()
  return {
    x: (Math.random() * 2 - 1) * Z * 0.9,
    y: (Math.random() * 2 - 1) * Z * 0.9,
    z: far ? Z : 40 + Math.random() * Z,
    hue: r < 0.62 ? 0 : r < 0.84 ? 1 : 2,
  }
}

function setupWarp() {
  const c = warp.value
  if (!c) return
  dpr = Math.min(devicePixelRatio || 1, 2)
  W = innerWidth
  H = innerHeight
  c.width = Math.floor(W * dpr)
  c.height = Math.floor(H * dpr)
  const g = c.getContext('2d')
  g?.setTransform(dpr, 0, 0, dpr, 0, 0)
  g?.clearRect(0, 0, W, H)
  const n = W < 700 ? Math.floor(STAR_COUNT * 0.6) : STAR_COUNT
  stars = Array.from({ length: n }, () => newStar())
  if (reduce) drawWarp(0, true)
}

const COLORS = ['0,245,212', '255,46,151', '220,255,252']

function drawWarp(dt: number, still = false) {
  const g = warp.value?.getContext('2d')
  if (!g) return
  const cx = W / 2
  const cy = H / 2
  const f = Math.max(W, H) * 0.55

  // fading trail instead of a hard clear = motion blur
  g.globalCompositeOperation = 'source-over'
  g.fillStyle = still ? 'rgb(4,9,12)' : `rgba(4,9,12,${leaving.value ? 0.16 : 0.3})`
  g.fillRect(0, 0, W, H)
  g.globalCompositeOperation = 'lighter'
  g.lineCap = 'round'

  const trail = Math.max(10, speed * 0.045)
  for (const s of stars) {
    const zPrev = s.z + trail
    s.z -= speed * dt
    const sx = cx + (s.x / s.z) * f
    const sy = cy + (s.y / s.z) * f
    if (s.z < 8 || sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) {
      Object.assign(s, newStar(true))
      continue
    }
    const px = cx + (s.x / zPrev) * f
    const py = cy + (s.y / zPrev) * f
    const near = 1 - s.z / Z // 0 far .. 1 close
    const a = Math.min(1, 0.15 + near * 1.1)
    g.strokeStyle = `rgba(${COLORS[s.hue] ?? COLORS[0]},${a.toFixed(3)})`
    g.lineWidth = 0.5 + near * 2.4
    g.beginPath()
    g.moveTo(px, py)
    g.lineTo(sx, sy)
    g.stroke()
  }
  g.globalCompositeOperation = 'source-over'
}

/* ---------- Main loop ---------- */
let raf = 0
let last = 0
let frames = 0
let exitTimer = 0

function frame(t: number) {
  if (!last) last = t
  const dtMs = Math.min(50, t - last)
  last = t
  const dt = dtMs / 1000
  frames++

  if (!ready.value) {
    // loading feels organic: it surges and slows a little instead of a flat line
    const surge = 0.55 + 0.9 * Math.pow(Math.abs(Math.sin(progress.value * 0.11)), 2)
    progress.value = Math.min(100, progress.value + (dtMs / duration) * 100 * surge)

    while (shown.value < steps.length && progress.value >= (steps[shown.value]?.at ?? Infinity)) {
      shown.value++
    }

    // the name locks in a little before 100%
    if (frames % 2 === 0) {
      display.value = scramble(title, Math.min(1, progress.value / 85))
    }

    if (progress.value >= 100) complete()
  }

  // ship speed: accelerates while loading, cruises when ready, JUMPS on exit
  if (leaving.value) {
    const k = Math.min(1, (t - exitStart) / EXIT_MS)
    speed = 300 + Math.pow(k, 2.4) * 9000
  } else if (ready.value) {
    speed += (260 - speed) * Math.min(1, dt * 3)
  } else {
    speed = 140 + (progress.value / 100) * 1100
  }

  if (!reduce) drawWarp(dt)
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
  exitStart = performance.now()
  exitTimer = window.setTimeout(() => emit('done'), EXIT_MS)
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  proceed()
}

/* 3D tilt: the reactor leans toward your cursor */
function onMove(e: PointerEvent) {
  const el = bootEl.value
  if (!el || reduce) return
  const x = (e.clientX / innerWidth - 0.5) * 2
  const y = (e.clientY / innerHeight - 0.5) * 2
  el.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`)
  el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`)
}

function onResize() {
  setupWarp()
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  setupWarp()
  addEventListener('keydown', onKey)
  addEventListener('resize', onResize)
  addEventListener('pointermove', onMove)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(exitTimer)
  removeEventListener('keydown', onKey)
  removeEventListener('resize', onResize)
  removeEventListener('pointermove', onMove)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
      ref="bootEl"
      class="boot"
      :class="{ ready, leaving }"
      role="progressbar"
      aria-label="Loading portfolio"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      @click="proceed"
  >
    <canvas ref="warp" class="warp" aria-hidden="true" />
    <div class="nebula" aria-hidden="true"></div>
    <div class="sweep" aria-hidden="true"></div>

    <span class="corner tl" aria-hidden="true" />
    <span class="corner tr" aria-hidden="true" />
    <span class="corner bl" aria-hidden="true" />
    <span class="corner br" aria-hidden="true" />
    <p class="hud hud-tl" aria-hidden="true">BOOT SEQUENCE<br>CSU-CARIG // CpE</p>
    <p class="hud hud-tr" aria-hidden="true">VELOCITY {{ Math.round(140 + progress * 11) }} km/s<br>SIGNAL ▮▮▮▮▯</p>
    <p class="hud hud-br" aria-hidden="true">MEM 0x{{ hex }}<br>{{ status }}</p>

    <div class="stage">
      <div class="box">
        <!-- holographic reactor -->
        <div class="reactor" aria-hidden="true">
          <span class="shock" />
          <span class="shock s2" />
          <svg viewBox="0 0 240 240">
            <defs>
              <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="55%" stop-color="#5ad7ff" />
                <stop offset="100%" stop-color="#ff2e97" />
              </linearGradient>
            </defs>
            <line
                v-for="(t, i) in ticks"
                :key="i"
                :x1="t.x1" :y1="t.y1" :x2="t.x2" :y2="t.y2"
                class="tick"
                :class="{ long: t.long, on: i < lit }"
            />
            <circle class="ring r-outer" cx="120" cy="120" r="116" />
            <circle class="ring r-seg" cx="120" cy="120" r="92" />
            <circle class="ring r-inner" cx="120" cy="120" r="70" />
            <circle class="track" cx="120" cy="120" :r="ARC_R" />
            <circle
                class="arc" cx="120" cy="120" :r="ARC_R"
                :stroke-dasharray="C" :stroke-dashoffset="offset"
                transform="rotate(-90 120 120)"
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
        <button class="launch" :class="{ show: ready }" type="button" tabindex="-1" @click.stop="proceed">
          <span>LAUNCH PORTFOLIO</span>
        </button>
        <p class="press" :class="{ show: ready }">
          press any key<span class="cursor" /> or tap the screen
        </p>
      </div>
    </div>

    <div class="burst" aria-hidden="true"></div>
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
  --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  --rx: 0deg;
  --ry: 0deg;

  position: fixed; inset: 0; z-index: 100; overflow: hidden;
  display: grid; place-items: center; padding: 24px;
  background: var(--bg); color: var(--ink); cursor: pointer; text-align: center;
  font-family: var(--mono);
}

/* ---------- background layers ---------- */
.warp { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

/* colored nebula glow that breathes behind everything */
.nebula {
  position: absolute; inset: -10%; z-index: 0; pointer-events: none;
  background:
      radial-gradient(40% 35% at 20% 25%, rgba(0, 245, 212, 0.16), transparent 70%),
      radial-gradient(38% 34% at 82% 70%, rgba(255, 46, 151, 0.15), transparent 70%),
      radial-gradient(45% 40% at 55% 105%, rgba(106, 61, 255, 0.2), transparent 70%);
  animation: breathe 6s ease-in-out infinite alternate;
}
@keyframes breathe { to { transform: scale(1.12) rotate(2deg); opacity: 0.75; } }

/* scanlines + vignette */
.boot::before {
  content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
      repeating-linear-gradient(0deg, rgba(0, 245, 212, 0.04) 0 1px, transparent 1px 3px),
      radial-gradient(circle at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.7) 100%);
}

/* moving scan bar */
.sweep {
  position: absolute; left: 0; right: 0; height: 140px; top: -140px; z-index: 1; pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(0, 245, 212, 0.07), transparent);
  animation: sweep 4.2s linear infinite;
}
@keyframes sweep { to { transform: translateY(calc(100vh + 280px)); } }

/* ---------- HUD frame ---------- */
.corner {
  position: absolute; width: 28px; height: 28px; z-index: 2; pointer-events: none;
  border: 2px solid var(--teal); opacity: 0.7;
}
.tl { top: 18px; left: 18px; border-right: 0; border-bottom: 0; }
.tr { top: 18px; right: 18px; border-left: 0; border-bottom: 0; }
.bl { bottom: 18px; left: 18px; border-right: 0; border-top: 0; }
.br { bottom: 18px; right: 18px; border-left: 0; border-top: 0; }
.hud {
  position: absolute; z-index: 2; margin: 0; pointer-events: none;
  font: 0.68rem/1.6 var(--mono); letter-spacing: 0.12em; color: var(--mute);
}
.hud-tl { top: 24px; left: 56px; text-align: left; }
.hud-tr { top: 24px; right: 56px; text-align: right; }
.hud-br { bottom: 24px; right: 56px; text-align: right; }

/* ---------- centre stage ---------- */
.stage { position: relative; z-index: 3; perspective: 900px; width: min(640px, 100%); }
.box {
  position: relative; width: 100%;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.25s ease-out;
  transform-style: preserve-3d;
  animation: flicker 7s infinite;
}

/* reactor */
.reactor { position: relative; width: min(250px, 58vw); aspect-ratio: 1; margin: 0 auto 22px; }
.reactor svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

.tick { stroke: rgba(0, 245, 212, 0.18); stroke-width: 1.2; transition: stroke 0.2s, filter 0.2s; }
.tick.long { stroke: rgba(0, 245, 212, 0.34); stroke-width: 1.8; }
.tick.on { stroke: var(--teal); filter: drop-shadow(0 0 3px rgba(0, 245, 212, 0.9)); }
.tick.long.on { stroke: #aefff3; }

.ring { fill: none; transform-origin: 120px 120px; }
.r-outer { stroke: rgba(0, 245, 212, 0.35); stroke-width: 1; stroke-dasharray: 2 9; animation: spin 26s linear infinite; }
.r-seg { stroke: rgba(255, 46, 151, 0.55); stroke-width: 2.4; stroke-dasharray: 46 30 12 30; animation: spin 14s linear infinite reverse; }
.r-inner { stroke: rgba(90, 215, 255, 0.4); stroke-width: 1; stroke-dasharray: 5 5; animation: spin 18s linear infinite; }

.track { fill: none; stroke: rgba(0, 245, 212, 0.1); stroke-width: 7; }
.arc {
  fill: none; stroke: url(#arcGrad); stroke-width: 7; stroke-linecap: round;
  filter: drop-shadow(0 0 7px rgba(0, 245, 212, 0.75)) drop-shadow(0 0 14px rgba(255, 46, 151, 0.35));
}

.radar {
  position: absolute; inset: 24%; border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(0, 245, 212, 0.4), transparent 28%);
  -webkit-mask-image: radial-gradient(circle, transparent 36%, #000 38%);
  mask-image: radial-gradient(circle, transparent 36%, #000 38%);
  animation: spin 2.4s linear infinite;
  opacity: 0.55;
}
.boot.ready .radar { animation-play-state: paused; opacity: 0.2; }

.center {
  position: absolute; inset: 0; display: flex; justify-content: center; align-items: center;
  font: 800 2.7rem/1 var(--mono); color: #eafffb;
  text-shadow: 0 0 18px rgba(0, 245, 212, 0.9), 0 0 40px rgba(0, 245, 212, 0.4);
}
.pc { font-size: 0.95rem; color: var(--mag); margin-left: 4px; text-shadow: 0 0 10px rgba(255, 46, 151, 0.7); }
.num { font-variant-numeric: tabular-nums; }

/* shockwave rings when loading completes */
.shock {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  border: 2px solid var(--teal); opacity: 0;
}
.boot.ready .shock { animation: shock 1.1s ease-out forwards; }
.boot.ready .shock.s2 { animation-delay: 0.18s; border-color: var(--mag); }

/* name + subtitle */
.name {
  position: relative; display: inline-block; margin: 0;
  font: 800 clamp(1.25rem, 4.8vw, 2.1rem)/1.15 var(--mono); letter-spacing: 0.07em;
  background: linear-gradient(100deg, #bffff4 0%, #00f5d4 35%, #ff2e97 70%, #bffff4 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  animation: shine 3.6s linear infinite;
  filter: drop-shadow(0 0 14px rgba(0, 245, 212, 0.45));
}
.boot.ready .name { animation-duration: 2s; }
@keyframes shine { to { background-position: -220% 0; } }
/* glitch slices (only flare up now and then) */
.glitch::before, .glitch::after {
  content: attr(data-text); position: absolute; inset: 0; pointer-events: none;
  -webkit-text-fill-color: currentColor; background: none;
  clip-path: inset(0 0 0 0); opacity: 0;
}
.glitch::before { color: var(--mag); animation: glitch-a 5s infinite steps(1); }
.glitch::after { color: #5ad7ff; animation: glitch-b 5s infinite steps(1); }
@keyframes glitch-a {
  0%, 92%, 100% { opacity: 0; transform: none; }
  93% { opacity: 0.85; transform: translate(-4px, 0); clip-path: inset(10% 0 62% 0); }
  96% { opacity: 0.85; transform: translate(3px, 0); clip-path: inset(58% 0 12% 0); }
}
@keyframes glitch-b {
  0%, 92%, 100% { opacity: 0; transform: none; }
  94% { opacity: 0.8; transform: translate(4px, 0); clip-path: inset(48% 0 24% 0); }
  97% { opacity: 0.8; transform: translate(-3px, 0); clip-path: inset(14% 0 58% 0); }
}
.sub { margin: 10px 0 18px; font-size: 0.72rem; letter-spacing: 0.3em; color: var(--mute); }

/* boot log */
.log {
  list-style: none; margin: 0 auto 14px; padding: 12px 18px; width: min(420px, 100%);
  text-align: left; font-size: 0.78rem; line-height: 1.8; color: var(--mute);
  background: rgba(2, 10, 14, 0.55); border: 1px solid rgba(0, 245, 212, 0.2);
  border-left: 3px solid var(--teal); border-radius: 8px;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.log li { opacity: 0; transform: translateX(-10px); transition: opacity 0.25s, transform 0.25s; }
.log li.show { opacity: 1; transform: none; }
.ok { color: var(--teal); text-shadow: 0 0 8px rgba(0, 245, 212, 0.7); }
.wait { color: var(--mag); animation: pulse 0.9s ease-in-out infinite; }

/* ready state */
.granted, .press { opacity: 0; transition: opacity 0.4s; margin: 0; }
.granted.show, .press.show { opacity: 1; }
.granted {
  font: 800 1rem var(--mono); letter-spacing: 0.4em; color: var(--teal);
  text-shadow: 0 0 16px rgba(0, 245, 212, 0.9); margin-bottom: 12px;
}
.launch {
  position: relative; overflow: hidden; cursor: pointer;
  font: 800 0.9rem var(--mono); letter-spacing: 0.22em; color: #021014;
  padding: 14px 30px; border: 0; border-radius: 12px;
  background: linear-gradient(100deg, #00f5d4, #5ad7ff 55%, #ff2e97);
  opacity: 0; transform: translateY(10px) scale(0.96); pointer-events: none;
  transition: opacity 0.4s 0.15s, transform 0.4s 0.15s, box-shadow 0.2s;
  box-shadow: 0 0 0 rgba(0, 245, 212, 0);
}
.launch.show {
  opacity: 1; transform: none; pointer-events: auto;
  animation: launch-pulse 1.8s ease-in-out infinite 0.6s;
}
.launch::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 40%; left: -60%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  transform: skewX(-20deg); animation: glint 2.6s ease-in-out infinite 0.8s;
}
.launch:hover { box-shadow: 0 0 36px rgba(0, 245, 212, 0.75), 0 0 60px rgba(255, 46, 151, 0.35); }
.press { margin-top: 14px; font-size: 0.72rem; letter-spacing: 0.14em; color: var(--mute); }
.cursor {
  display: inline-block; width: 8px; height: 0.95em; margin: 0 6px 0 8px;
  vertical-align: text-bottom; background: var(--mag);
  animation: blink 1s steps(1) infinite;
}

/* ---------- exit: HYPERJUMP ---------- */
.boot.leaving { pointer-events: none; }
.boot.leaving .box { animation: jump 0.9s cubic-bezier(0.6, 0, 0.9, 0.4) forwards; }
.boot.leaving .hud, .boot.leaving .corner { animation: fade-out 0.5s ease forwards; }
.burst {
  position: absolute; inset: 0; z-index: 6; pointer-events: none; opacity: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 245, 212, 0.9) 0%, rgba(90, 215, 255, 0.45) 22%, rgba(4, 9, 12, 0) 60%);
}
.boot.leaving .burst { animation: burst 0.9s ease-in forwards; }

/* ---------- keyframes ---------- */
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse { 50% { opacity: 0.45; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shock {
  0% { opacity: 0.85; transform: scale(0.75); }
  100% { opacity: 0; transform: scale(1.9); }
}
@keyframes flicker {
  0%, 94%, 100% { opacity: 1; }
  95% { opacity: 0.88; }
  96% { opacity: 1; }
  97% { opacity: 0.92; }
}
@keyframes launch-pulse {
  0%, 100% { box-shadow: 0 0 14px rgba(0, 245, 212, 0.35); }
  50% { box-shadow: 0 0 34px rgba(0, 245, 212, 0.8), 0 0 56px rgba(255, 46, 151, 0.35); }
}
@keyframes glint { 0% { left: -60%; } 55%, 100% { left: 130%; } }
@keyframes fade-out { to { opacity: 0; } }
@keyframes jump {
  0% { transform: scale(1); opacity: 1; filter: blur(0); }
  60% { opacity: 0.9; }
  100% { transform: scale(3.2); opacity: 0; filter: blur(10px); }
}
@keyframes burst {
  0% { opacity: 0; transform: scale(0.4); }
  55% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.8); } /* ends transparent: never leaves a white screen */
}

@media (max-width: 560px) {
  .hud-tr { display: none; }
  .hud-tl, .hud-br { left: 50px; right: 50px; font-size: 0.6rem; }
  .hud-br { left: auto; }
  .center { font-size: 2.2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .box, .sweep, .nebula, .radar, .ring, .shock, .name, .glitch::before, .glitch::after,
  .launch, .launch::after, .wait, .cursor,
  .boot.leaving .box, .boot.leaving .burst, .boot.leaving .hud, .boot.leaving .corner { animation: none !important; }
  .glitch::before, .glitch::after, .warp { display: none; }
  .box { transform: none; transition: none; }
}
</style>