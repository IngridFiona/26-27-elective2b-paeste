<script setup lang="ts">
/*
GLITCH EFFECTS  (new file: src/components/GlitchFX.vue)

Adds a cyber "glitch" feel to the whole portfolio without touching your
other components:

  1. RANDOM SCREEN GLITCH  - every few seconds the whole page glitches for a
     moment: headings, buttons, pills, badges and the photo split into
     teal / magenta ghosts and jump sideways, colored scan bars flash across
     the screen and the edges flicker.
  2. HEADINGS GLITCH IN    - each heading glitches once when you scroll to it.
  3. HOVER GLITCH          - hover headings, buttons, tech pills, badges and
     your photo to make them glitch.
  4. CLICK GLITCH          - clicking a nav link, button or the theme toggle
     triggers a short glitch.

Everything is switched off automatically for people who use the
"reduce motion" setting. Change the numbers below to taste.
*/
import { onBeforeUnmount, onMounted, ref } from 'vue'

/* ---------- settings you can tweak ---------- */
const RANDOM_GLITCH = true      // false = only glitch on hover / click / scroll
const EVERY = [4, 9]            // seconds between random glitches (min, max)
const LENGTH = 460              // how long a glitch lasts (ms)
const BARS = 6                  // max colored scan bars per glitch (0 = none)
const HEADINGS_ON_SCROLL = true // headings glitch once when scrolled into view

const layer = ref<HTMLDivElement | null>(null)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

let timer = 0
let offTimer = 0
let observer: IntersectionObserver | null = null
const root = document.documentElement

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/* ---------- the big glitch ---------- */
function burst(strong = true) {
  if (reduce) return
  const box = layer.value
  clearTimeout(offTimer)
  root.classList.remove('gl-on', 'gl-soft')
  void root.offsetWidth // restart the CSS animations
  root.classList.add(strong ? 'gl-on' : 'gl-soft')

  if (box) {
    box.querySelectorAll('.gl-bar').forEach((b) => b.remove())
    const n = strong ? Math.floor(rnd(Math.max(1, BARS / 2), BARS + 1)) : Math.min(2, BARS)
    for (let i = 0; i < n; i++) {
      const bar = document.createElement('i')
      bar.className = 'gl-bar'
      bar.style.top = `${rnd(0, 96).toFixed(1)}%`
      bar.style.height = `${Math.round(rnd(2, strong ? 46 : 14))}px`
      bar.style.setProperty('--dx', `${Math.round(rnd(-40, 40))}px`)
      bar.style.animationDelay = `${Math.round(rnd(0, LENGTH * 0.5))}ms`
      bar.style.background = Math.random() < 0.5
          ? `rgba(0,245,212,${rnd(0.1, 0.3).toFixed(2)})`
          : `rgba(255,46,151,${rnd(0.1, 0.3).toFixed(2)})`
      box.appendChild(bar)
    }
  }
  offTimer = window.setTimeout(() => {
    root.classList.remove('gl-on', 'gl-soft')
    box?.querySelectorAll('.gl-bar').forEach((b) => b.remove())
  }, LENGTH + 120)
}

/* ---------- random timing ---------- */
function schedule() {
  if (!RANDOM_GLITCH || reduce) return
  const wait = rnd(EVERY[0] ?? 4, EVERY[1] ?? 9) * 1000
  timer = window.setTimeout(() => {
    if (!document.hidden) {
      burst(true)
      // now and then a quick double-glitch
      if (Math.random() < 0.3) window.setTimeout(() => burst(false), LENGTH + 160)
    }
    schedule()
  }, wait)
}

/* ---------- one heading glitches when it scrolls into view ---------- */
function glitchOne(el: Element) {
  el.classList.remove('gl-one')
  void (el as HTMLElement).offsetWidth
  el.classList.add('gl-one')
  window.setTimeout(() => el.classList.remove('gl-one'), 620)
}

function watchHeadings() {
  if (!HEADINGS_ON_SCROLL || reduce) return
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      glitchOne(e.target)
      observer?.unobserve(e.target)
    }
  }, { threshold: 0.7 })
  document.querySelectorAll('main h1, main h2, main h3').forEach((h) => observer?.observe(h))
}

/* ---------- clicks ---------- */
function onClick(e: MouseEvent) {
  const el = e.target as HTMLElement | null
  if (el?.closest('nav a, .toggle, .btn, button')) burst(false)
}

onMounted(() => {
  document.addEventListener('click', onClick)
  schedule()
  // wait one frame so every section is already on the page
  requestAnimationFrame(watchHeadings)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  clearTimeout(timer)
  clearTimeout(offTimer)
  observer?.disconnect()
  root.classList.remove('gl-on', 'gl-soft')
})
</script>

<template>
  <div ref="layer" class="gl-layer" aria-hidden="true">
    <div class="gl-edge"></div>
  </div>
</template>

<!-- plain (global) styles on purpose: they target elements in other components -->
<style>
/* ---------- overlay: scan bars + flickering edges ---------- */
.gl-layer {
  position: fixed; inset: 0; z-index: 9000; overflow: hidden; pointer-events: none;
}
.gl-edge { position: absolute; inset: 0; opacity: 0; }
html.gl-on .gl-edge { animation: gl-edge 0.46s steps(1) forwards; }
html.gl-soft .gl-edge { animation: gl-edge-soft 0.3s steps(1) forwards; }
.gl-bar {
  position: absolute; left: -5%; width: 110%; opacity: 0;
  animation: gl-bar 0.34s steps(1) forwards;
}

/* ---------- everything glitches during a screen glitch ----------
   Uses text-shadow / drop-shadow + the separate `translate` property, so it
   never fights with your own transforms and animations. */
html.gl-on :is(h1, h2, h3, nav a, .btn, .type) { animation: gl-text 0.46s steps(1) forwards; }
html.gl-soft :is(h1, h2, h3, .btn) { animation: gl-text-soft 0.3s steps(1) forwards; }
html.gl-on :is(.photo, .pill, .badge, .thumb) { animation: gl-img 0.46s steps(1) forwards; }
html.gl-soft :is(.photo) { animation: gl-img-soft 0.3s steps(1) forwards; }

/* ---------- one heading as it scrolls in ---------- */
main :is(h1, h2, h3).gl-one { animation: gl-text 0.6s steps(1) forwards; }

/* ---------- hover ---------- */
main :is(h1, h2, h3):hover,
.btn:hover { animation: gl-text-soft 0.35s steps(1) 1; }
:is(.photo, .pill, .badge):hover { animation: gl-img-soft 0.35s steps(1) 1; }

/* ---------- keyframes ---------- */
@keyframes gl-text {
  0%   { text-shadow: none; translate: 0 0; }
  8%   { text-shadow: 4px 0 var(--mag), -4px 0 var(--teal); translate: -3px 0; }
  16%  { text-shadow: -5px 0 var(--mag), 5px 0 var(--teal); translate: 4px 1px; }
  24%  { text-shadow: none; translate: 0 0; }
  38%  { text-shadow: 3px 1px var(--teal), -3px -1px var(--mag); translate: 2px -1px; }
  46%  { text-shadow: none; translate: 0 0; }
  62%  { text-shadow: -6px 0 var(--mag), 6px 0 var(--teal); translate: -5px 0; }
  70%  { text-shadow: 2px 0 var(--mag), -2px 0 var(--teal); translate: 3px 0; }
  80%  { text-shadow: none; translate: 0 0; }
  100% { text-shadow: none; translate: 0 0; }
}
@keyframes gl-text-soft {
  0%   { text-shadow: none; translate: 0 0; }
  20%  { text-shadow: 3px 0 var(--mag), -3px 0 var(--teal); translate: -2px 0; }
  45%  { text-shadow: -3px 0 var(--mag), 3px 0 var(--teal); translate: 2px 0; }
  70%  { text-shadow: 2px 0 var(--teal), -2px 0 var(--mag); translate: -1px 0; }
  100% { text-shadow: none; translate: 0 0; }
}
@keyframes gl-img {
  0%   { filter: none; translate: 0 0; }
  10%  { filter: drop-shadow(6px 0 rgba(255, 46, 151, 0.75)) drop-shadow(-6px 0 rgba(0, 245, 212, 0.75)); translate: -4px 0; }
  22%  { filter: none; translate: 0 0; }
  40%  { filter: drop-shadow(-8px 0 rgba(255, 46, 151, 0.75)) drop-shadow(8px 0 rgba(0, 245, 212, 0.75)) hue-rotate(25deg); translate: 5px 1px; }
  52%  { filter: none; translate: 0 0; }
  68%  { filter: drop-shadow(4px 0 rgba(0, 245, 212, 0.8)) drop-shadow(-4px 0 rgba(255, 46, 151, 0.8)); translate: -3px 0; }
  82%, 100% { filter: none; translate: 0 0; }
}
@keyframes gl-img-soft {
  0%   { filter: none; translate: 0 0; }
  25%  { filter: drop-shadow(4px 0 rgba(255, 46, 151, 0.7)) drop-shadow(-4px 0 rgba(0, 245, 212, 0.7)); translate: -2px 0; }
  55%  { filter: drop-shadow(-4px 0 rgba(255, 46, 151, 0.7)) drop-shadow(4px 0 rgba(0, 245, 212, 0.7)); translate: 2px 0; }
  100% { filter: none; translate: 0 0; }
}
@keyframes gl-edge {
  0%   { opacity: 0; }
  10%  { opacity: 1; box-shadow: inset 8px 0 0 rgba(255, 46, 151, 0.28), inset -8px 0 0 rgba(0, 245, 212, 0.28); }
  30%  { opacity: 0; }
  50%  { opacity: 1; box-shadow: inset -10px 0 0 rgba(255, 46, 151, 0.22), inset 10px 0 0 rgba(0, 245, 212, 0.22); }
  70%, 100% { opacity: 0; }
}
@keyframes gl-edge-soft {
  0% { opacity: 0; }
  25% { opacity: 1; box-shadow: inset 5px 0 0 rgba(255, 46, 151, 0.2), inset -5px 0 0 rgba(0, 245, 212, 0.2); }
  60%, 100% { opacity: 0; }
}
@keyframes gl-bar {
  0%   { opacity: 0; transform: translateX(0); }
  15%  { opacity: 1; transform: translateX(var(--dx)); }
  45%  { opacity: 0; }
  60%  { opacity: 1; transform: translateX(calc(var(--dx) * -1)); }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .gl-layer { display: none; }
  html.gl-on *, html.gl-soft *, .gl-one { animation: none !important; }
}
</style>