<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data'

const emit = defineEmits<{ done: [] }>()

/* Edit these */
const subtitle = 'COMPUTER ENGINEERING // PORTFOLIO v1.0'
const steps = [
  { at: 8, text: 'Initializing portfolio.sys' },
  { at: 30, text: 'Loading profile photo' },
  { at: 55, text: 'Mounting certificates' },
  { at: 78, text: 'Linking social profiles' },
  { at: 100, text: 'Starting interface' },
]

const SEGMENTS = 40
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const duration = reduce ? 500 : 2600

const progress = ref(0)
const shown = ref(0)
const ready = ref(false)
const leaving = ref(false)

const percent = computed(() => Math.floor(progress.value))
const filled = computed(() => Math.floor((progress.value / 100) * SEGMENTS))
const title = computed(() => profile.name.toUpperCase())

let raf = 0
let last = 0

function frame(t: number) {
  if (!last) last = t
  const dt = t - last
  last = t

  progress.value = Math.min(100, progress.value + (dt / duration) * 100)

  while (shown.value < steps.length && progress.value >= steps[shown.value]!.at) {
    shown.value++
  }

  if (progress.value >= 100) complete()
  else raf = requestAnimationFrame(frame)
}

function complete() {
  cancelAnimationFrame(raf)
  progress.value = 100
  shown.value = steps.length
  ready.value = true
}

function proceed() {
  if (leaving.value) return
  if (!ready.value) {
    complete()
    return
  }
  leaving.value = true
  emit('done')
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  proceed()
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  addEventListener('keydown', onKey)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div
      class="boot"
      :class="{ ready }"
      role="progressbar"
      aria-label="Loading portfolio"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      @click="proceed"
  >
    <div class="sweep" aria-hidden="true"></div>

    <div class="box">
      <div class="prompt" aria-hidden="true" data-text=">_">&gt;_</div>

      <h1 class="name glitch" :data-text="title">{{ title }}</h1>
      <p class="sub">{{ subtitle }}</p>

      <ul class="log" aria-live="polite">
        <li v-for="(s, i) in steps" :key="s.text" :class="{ show: i < shown }">
          <span class="ok">[ OK ]</span> {{ s.text }}
        </li>
      </ul>

      <div class="bar" aria-hidden="true">
        <span v-for="n in SEGMENTS" :key="n" class="seg" :class="{ on: n <= filled }" />
      </div>
      <p class="pct">
        <span class="pct-num glitch-sm" :data-text="percent + '%'">{{ percent }}%</span> loading...
      </p>

      <p class="press" :class="{ show: ready }">
        Press any key to continue<span class="cursor" />
      </p>
      <p class="tap" :class="{ show: ready }">(or tap the screen)</p>
    </div>
  </div>
</template>

<style scoped>
.boot {
  position: fixed; inset: 0; z-index: 100; overflow: hidden;
  display: grid; place-items: center; padding: 24px;
  background: var(--bg); cursor: pointer; text-align: center;
  animation: flicker 6s infinite;
}

/* scanlines + glow + vignette */
.boot::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
      repeating-linear-gradient(0deg, rgba(0, 245, 212, 0.06) 0 1px, transparent 1px 3px),
      radial-gradient(circle at 50% 35%, rgba(0, 245, 212, 0.14), transparent 60%),
      radial-gradient(circle at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
}

/* moving scan bar */
.sweep {
  position: absolute; left: 0; right: 0; height: 120px; top: -120px;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(0, 245, 212, 0.09), transparent);
  animation: sweep 4.5s linear infinite;
}

.box { position: relative; width: min(660px, 100%); }

/* ---------- glitch text (teal + pink split layers) ---------- */
.glitch, .glitch-sm, .prompt { position: relative; display: inline-block; }
.glitch::before, .glitch::after,
.glitch-sm::before, .glitch-sm::after,
.prompt::before, .prompt::after {
  content: attr(data-text);
  position: absolute; inset: 0;
  pointer-events: none;
}
.glitch::before, .glitch-sm::before, .prompt::before {
  color: var(--teal);
  transform: translate(-3px, 0);
  clip-path: inset(0 0 60% 0);
  animation: glitch-a 3.2s steps(1) infinite;
}
.glitch::after, .glitch-sm::after, .prompt::after {
  color: var(--mag);
  transform: translate(3px, 0);
  clip-path: inset(55% 0 0 0);
  animation: glitch-b 2.7s steps(1) infinite;
}
.glitch-sm::before, .glitch-sm::after { animation-duration: 1.4s; }

.prompt {
  font: 800 clamp(2.4rem, 8vw, 3.4rem) var(--mono);
  color: var(--mag); text-shadow: 0 0 22px rgba(255, 46, 151, 0.7);
  margin-bottom: 14px;
}

.name {
  font: 800 clamp(1.7rem, 6vw, 3rem) var(--sans);
  letter-spacing: 0.03em; color: var(--ink);
  text-shadow: 0 0 24px rgba(0, 245, 212, 0.4);
  animation: glitch-in 0.9s steps(1) 1, shake 5s steps(1) 1s infinite;
}

.sub { margin: 14px 0 34px; font: 0.85rem var(--mono); letter-spacing: 0.1em; color: var(--mute); }

/* ---------- log ---------- */
.log {
  display: inline-block; margin: 0 0 34px; padding: 0; list-style: none;
  text-align: left; font: 0.95rem/1.9 var(--mono); color: var(--mute);
}
.log li { opacity: 0; transform: translateX(-10px); transition: opacity 0.2s, transform 0.2s; }
.log li.show { opacity: 1; transform: none; animation: line-flash 0.35s steps(2); }
.ok { color: var(--teal); font-weight: 700; margin-right: 6px; text-shadow: 0 0 10px rgba(0, 245, 212, 0.7); }

/* ---------- progress bar ---------- */
.bar {
  display: flex; gap: 3px; padding: 5px; width: 100%;
  border: 1px solid var(--teal); border-radius: 2px;
  box-shadow: 0 0 16px rgba(0, 245, 212, 0.3), inset 0 0 10px rgba(0, 245, 212, 0.12);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}
.seg { flex: 1; height: 14px; background: rgba(0, 245, 212, 0.1); transform: skewX(-18deg); transition: background 0.1s; }
.seg.on { background: var(--teal); box-shadow: 0 0 8px var(--teal); }
.seg.on:last-of-type { background: var(--mag); box-shadow: 0 0 8px var(--mag); }

.pct { margin: 18px 0 34px; font: 0.9rem var(--mono); color: var(--mute); }
.pct-num { color: var(--teal); font-weight: 700; text-shadow: 0 0 10px rgba(0, 245, 212, 0.6); min-width: 3.2ch; }

/* ---------- call to action ---------- */
.press, .tap { opacity: 0; transition: opacity 0.4s; margin: 0; }
.press.show, .tap.show { opacity: 1; }
.press { font: 700 1.15rem var(--mono); color: var(--mag); text-shadow: 0 0 14px rgba(255, 46, 151, 0.6); }
.boot.ready .press { animation: pulse 1.6s ease-in-out infinite; }
.tap { margin-top: 12px; font: 0.8rem var(--mono); color: var(--mute); }

.cursor {
  display: inline-block; width: 12px; height: 1.1em; margin-left: 10px;
  vertical-align: text-bottom; background: var(--mag);
  animation: blink 1s steps(1) infinite;
}

/* ---------- keyframes ---------- */
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse { 50% { opacity: 0.65; } }
@keyframes sweep { to { transform: translateY(calc(100vh + 240px)); } }

@keyframes flicker {
  0%, 94%, 100% { opacity: 1; }
  95% { opacity: 0.86; }
  96% { opacity: 1; }
  97% { opacity: 0.9; }
}

@keyframes line-flash {
  0% { color: var(--teal); text-shadow: 0 0 10px var(--teal); }
  100% { color: var(--mute); text-shadow: none; }
}

/* split layers jump around now and then */
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

/* name slams in with RGB jitter */
@keyframes glitch-in {
  0% { opacity: 0; transform: translateX(-14px) skewX(12deg); filter: blur(3px); }
  15% { opacity: 1; transform: translateX(10px) skewX(-10deg); }
  30% { opacity: 0.2; transform: translateX(-6px); }
  45% { opacity: 1; transform: translateX(4px) skewX(6deg); filter: none; }
  60% { opacity: 0.5; transform: translateX(0); }
  100% { opacity: 1; transform: none; }
}
@keyframes shake {
  0%, 92%, 100% { transform: none; }
  93% { transform: translate(-2px, 1px) skewX(-4deg); }
  95% { transform: translate(3px, -1px) skewX(4deg); }
  97% { transform: translate(-1px, 0); }
}

@media (max-width: 520px) {
  .log { font-size: 0.82rem; }
  .seg { height: 11px; }
}

@media (prefers-reduced-motion: reduce) {
  .boot, .sweep, .name, .glitch::before, .glitch::after,
  .glitch-sm::before, .glitch-sm::after, .prompt::before, .prompt::after,
  .boot.ready .press, .log li.show { animation: none; }
  .glitch::before, .glitch::after, .glitch-sm::before, .glitch-sm::after,
  .prompt::before, .prompt::after { display: none; }
}
</style>