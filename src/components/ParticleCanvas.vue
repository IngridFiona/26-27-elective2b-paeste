<script setup lang="ts">
/*
GALAXY / AURORA BACKGROUND  (drop-in replacement for ParticleCanvas.vue)

Layers, back to front:
  1. Aurora    - big soft glowing color clouds that slowly drift (pure CSS)
  2. Grid      - a neon perspective floor that scrolls toward you (pure CSS)
  3. Canvas    - twinkling stars + constellation lines, shooting stars,
                 mouse parallax, cursor "gravity" glow, click bursts,
                 and a gentle parallax when you scroll
  4. Vignette  - dark edges so your content stays readable

It follows the dark / light theme automatically and respects
"reduce motion" in the user's system settings.
*/
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Star {
  x: number; y: number          // position (0..W, 0..H)
  vx: number; vy: number        // slow drift
  r: number                     // radius
  depth: number                 // 0.3 (far) .. 1 (near) -> parallax strength
  tw: number                    // twinkle phase
  ts: number                    // twinkle speed
  kind: 0 | 1 | 2               // 0 = teal, 1 = magenta, 2 = white
  life: number                  // -1 = permanent, otherwise seconds left (click-burst stars)
}
interface Shooter { x: number; y: number; vx: number; vy: number; life: number; max: number }
interface Ripple { x: number; y: number; r: number; a: number }

/* ---------- settings you can tweak ---------- */
const STAR_DENSITY = 9000    // px² per star. Smaller number = MORE stars
const MAX_STARS = 170
const LINK_DIST = 125        // stars closer than this get a line between them
const MOUSE_RADIUS = 190     // how far the cursor reaches
const PARALLAX = 26          // px the stars shift when the mouse moves (bigger = stronger)
const SCROLL_PARALLAX = 0.18 // how much stars slide when you scroll
const SHOOTING_EVERY = [2.5, 6] // seconds between shooting stars (min, max)

const canvas = ref<HTMLCanvasElement | null>(null)
const isLight = ref(false) // switches the CSS to the light look
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const mouse = { x: -999, y: -999 }
const smooth = { x: 0, y: 0 } // smoothed mouse offset for parallax

let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0
let dpr = 1
let raf = 0
let resizeTimer = 0
let observer: MutationObserver | null = null
let stars: Star[] = []
let shooters: Shooter[] = []
let ripples: Ripple[] = []
let light = false
let tealRgb = '0,245,212'
let magRgb = '255,46,151'
let whiteRgb = '255,255,255'
let lastT = 0
let nextShot = 2
let clock = 0

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function readTheme() {
  light = document.documentElement.dataset.theme === 'light'
  isLight.value = light
  tealRgb = light ? '0,121,107' : '0,245,212'
  magRgb = light ? '196,0,95' : '255,46,151'
  whiteRgb = light ? '11,42,46' : '255,255,255'
}
const rgbOf = (k: number) => (k === 0 ? tealRgb : k === 1 ? magRgb : whiteRgb)

function makeStar(life = -1, x?: number, y?: number): Star {
  const roll = Math.random()
  return {
    x: x ?? rnd(0, W),
    y: y ?? rnd(0, H),
    vx: rnd(-0.12, 0.12),
    vy: rnd(-0.1, 0.1),
    r: rnd(0.6, 1.9),
    depth: rnd(0.3, 1),
    tw: rnd(0, Math.PI * 2),
    ts: rnd(0.6, 2.2),
    kind: roll < 0.5 ? 0 : roll < 0.72 ? 1 : 2,
    life,
  }
}

function setup() {
  const c = canvas.value
  if (!c) return
  dpr = Math.min(devicePixelRatio || 1, 2)
  W = innerWidth
  H = innerHeight
  c.width = Math.floor(W * dpr)
  c.height = Math.floor(H * dpr)
  ctx = c.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  readTheme()
  const n = Math.min(MAX_STARS, Math.floor((W * H) / STAR_DENSITY))
  stars = []
  for (let i = 0; i < n; i++) stars.push(makeStar())
  shooters = []
  ripples = []
  if (reduce) frame(performance.now())
}

function spawnShooter() {
  // starts above / left of the screen and flies diagonally down-right
  const fromTop = Math.random() < 0.6
  const x = fromTop ? rnd(0, W) : -40
  const y = fromTop ? -40 : rnd(0, H * 0.5)
  const speed = rnd(700, 1100)
  const ang = rnd(0.45, 0.8) // radians below horizontal
  shooters.push({
    x, y,
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed,
    life: 0,
    max: rnd(0.9, 1.5),
  })
}

function burst(x: number, y: number) {
  ripples.push({ x, y, r: 6, a: 0.8 })
  for (let i = 0; i < 14; i++) {
    const s = makeStar(rnd(2.5, 4.5), x, y)
    const ang = Math.random() * Math.PI * 2
    const sp = rnd(30, 120)
    s.vx = Math.cos(ang) * sp * 0.02
    s.vy = Math.sin(ang) * sp * 0.02
    s.r = rnd(1, 2.4)
    s.depth = 1
    stars.push(s)
  }
}

function frame(t: number) {
  if (!reduce) raf = requestAnimationFrame(frame)
  const g = ctx
  if (!g) return
  const dt = Math.min(0.05, Math.max(0, (t - lastT) / 1000))
  lastT = t
  clock += dt

  g.clearRect(0, 0, W, H)
  g.globalCompositeOperation = light ? 'source-over' : 'lighter'

  // ease the parallax offset toward the mouse (center of screen = 0)
  const tx = mouse.x > -500 ? (mouse.x / W - 0.5) * 2 : 0
  const ty = mouse.y > -500 ? (mouse.y / H - 0.5) * 2 : 0
  smooth.x += (tx - smooth.x) * Math.min(1, dt * 3)
  smooth.y += (ty - smooth.y) * Math.min(1, dt * 3)
  const scroll = scrollY * SCROLL_PARALLAX

  /* ----- move + project the stars ----- */
  const px: number[] = []
  const py: number[] = []
  const alive: Star[] = []
  for (const s of stars) {
    if (s.life >= 0) {
      s.life -= dt
      if (s.life <= 0) continue
    }
    alive.push(s)
    s.x += s.vx * (reduce ? 0 : 60 * dt)
    s.y += s.vy * (reduce ? 0 : 60 * dt)
    // wrap around the edges
    if (s.life < 0) {
      if (s.x < -20) s.x = W + 20
      else if (s.x > W + 20) s.x = -20
      if (s.y < -20) s.y = H + 20
      else if (s.y > H + 20) s.y = -20
    }
    let x = s.x - smooth.x * PARALLAX * s.depth
    let y = s.y - smooth.y * PARALLAX * s.depth - scroll * s.depth
    y = ((y % H) + H) % H // scrolling wraps the stars so the sky never runs out

    // cursor gravity: stars lean toward the pointer
    const dx = mouse.x - x
    const dy = mouse.y - y
    const d = Math.hypot(dx, dy)
    if (d < MOUSE_RADIUS && d > 1) {
      const pull = (1 - d / MOUSE_RADIUS) * 22 * s.depth
      x += (dx / d) * pull
      y += (dy / d) * pull
    }
    px.push(x)
    py.push(y)
  }
  stars = alive

  /* ----- constellation lines between close stars ----- */
  g.lineWidth = 0.8
  const L2 = LINK_DIST * LINK_DIST
  for (let i = 0; i < stars.length; i++) {
    const xi = px[i] ?? 0
    const yi = py[i] ?? 0
    for (let j = i + 1; j < stars.length; j++) {
      const dx = xi - (px[j] ?? 0)
      const dy = yi - (py[j] ?? 0)
      const d2 = dx * dx + dy * dy
      if (d2 > L2) continue
      const a = (1 - Math.sqrt(d2) / LINK_DIST) * (light ? 0.3 : 0.38)
      g.strokeStyle = `rgba(${tealRgb},${a.toFixed(3)})`
      g.beginPath()
      g.moveTo(xi, yi)
      g.lineTo(px[j] ?? 0, py[j] ?? 0)
      g.stroke()
    }
    // lines from stars to the cursor (magenta)
    const mx = mouse.x - xi
    const my = mouse.y - yi
    const md = Math.hypot(mx, my)
    if (md < MOUSE_RADIUS) {
      const a = (1 - md / MOUSE_RADIUS) * 0.75
      g.strokeStyle = `rgba(${magRgb},${a.toFixed(3)})`
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(xi, yi)
      g.lineTo(mouse.x, mouse.y)
      g.stroke()
      g.lineWidth = 0.8
    }
  }

  /* ----- the stars themselves (twinkling) ----- */
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i]
    if (!s) continue
    const x = px[i] ?? 0
    const y = py[i] ?? 0
    const tw = 0.55 + 0.45 * Math.sin(clock * s.ts + s.tw)
    const fade = s.life >= 0 ? Math.min(1, s.life / 1.2) : 1
    const rgb = rgbOf(s.kind)
    const a = (light ? 0.55 : 0.85) * tw * fade
    // soft halo
    const halo = s.r * (5 + tw * 3)
    const grd = g.createRadialGradient(x, y, 0, x, y, halo)
    grd.addColorStop(0, `rgba(${rgb},${(a * 0.55).toFixed(3)})`)
    grd.addColorStop(1, `rgba(${rgb},0)`)
    g.fillStyle = grd
    g.beginPath()
    g.arc(x, y, halo, 0, Math.PI * 2)
    g.fill()
    // bright core
    g.fillStyle = `rgba(${rgb},${a.toFixed(3)})`
    g.beginPath()
    g.arc(x, y, s.r * (0.8 + tw * 0.4), 0, Math.PI * 2)
    g.fill()
  }

  /* ----- cursor glow ----- */
  if (mouse.x > -500) {
    const grd = g.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120)
    grd.addColorStop(0, `rgba(${magRgb},${light ? 0.14 : 0.22})`)
    grd.addColorStop(0.5, `rgba(${tealRgb},${light ? 0.05 : 0.08})`)
    grd.addColorStop(1, `rgba(${tealRgb},0)`)
    g.fillStyle = grd
    g.beginPath()
    g.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2)
    g.fill()
  }

  /* ----- shooting stars ----- */
  if (!reduce) {
    nextShot -= dt
    if (nextShot <= 0) {
      spawnShooter()
      nextShot = rnd(SHOOTING_EVERY[0] ?? 2.5, SHOOTING_EVERY[1] ?? 6)
    }
  }
  const liveShots: Shooter[] = []
  for (const sh of shooters) {
    sh.life += dt
    if (sh.life > sh.max) continue
    sh.x += sh.vx * dt
    sh.y += sh.vy * dt
    liveShots.push(sh)
    const k = 1 - sh.life / sh.max
    const len = 0.16 // tail length in seconds of travel
    const tx2 = sh.x - sh.vx * len
    const ty2 = sh.y - sh.vy * len
    const grd = g.createLinearGradient(sh.x, sh.y, tx2, ty2)
    grd.addColorStop(0, `rgba(${whiteRgb},${(0.95 * k).toFixed(3)})`)
    grd.addColorStop(0.3, `rgba(${tealRgb},${(0.55 * k).toFixed(3)})`)
    grd.addColorStop(1, `rgba(${magRgb},0)`)
    g.strokeStyle = grd
    g.lineWidth = 2
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(sh.x, sh.y)
    g.lineTo(tx2, ty2)
    g.stroke()
  }
  shooters = liveShots

  /* ----- click ripples ----- */
  const liveRipples: Ripple[] = []
  for (const r of ripples) {
    r.r += 160 * dt
    r.a -= 0.9 * dt
    if (r.a <= 0) continue
    liveRipples.push(r)
    g.strokeStyle = `rgba(${magRgb},${r.a.toFixed(3)})`
    g.lineWidth = 1.5
    g.beginPath()
    g.arc(r.x, r.y, r.r, 0, Math.PI * 2)
    g.stroke()
    g.strokeStyle = `rgba(${tealRgb},${(r.a * 0.6).toFixed(3)})`
    g.beginPath()
    g.arc(r.x, r.y, r.r * 0.65, 0, Math.PI * 2)
    g.stroke()
  }
  ripples = liveRipples

  g.globalCompositeOperation = 'source-over'
}

/* ---------- events ---------- */
const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
const onLeave = () => { mouse.x = -999; mouse.y = -999 }
const onDown = (e: PointerEvent) => {
  // only burst when clicking empty space, not buttons / links / inputs
  const el = e.target as HTMLElement | null
  if (el?.closest('a, button, input, textarea, select, label, [role="button"]')) return
  burst(e.clientX, e.clientY)
}
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    // ignore the small height changes of mobile address bars
    if (Math.abs(innerWidth - W) < 2 && Math.abs(innerHeight - H) < 160) return
    setup()
  }, 150)
}

onMounted(() => {
  setup()
  if (!reduce) raf = requestAnimationFrame(frame)
  addEventListener('resize', onResize)
  addEventListener('pointermove', onMove)
  addEventListener('pointerdown', onDown)
  document.addEventListener('pointerleave', onLeave)
  observer = new MutationObserver(() => {
    readTheme()
    if (reduce) frame(performance.now())
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  observer?.disconnect()
  removeEventListener('resize', onResize)
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerdown', onDown)
  document.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <div class="bg-root" :class="{ light: isLight }" aria-hidden="true">
    <div class="aurora">
      <i class="blob b1"></i>
      <i class="blob b2"></i>
      <i class="blob b3"></i>
      <i class="blob b4"></i>
    </div>
    <div class="floor"><div class="grid-plane"></div></div>
    <canvas ref="canvas" class="stars"></canvas>
    <div class="vignette"></div>
  </div>
</template>

<style scoped>
.bg-root {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate; /* everything inside stays inside this box */
}

/* ---------- 1. aurora clouds ----------
   Soft radial gradients only (no blur filter, no blend modes), so they
   render the same in every browser and can never "white out" the page. */
.aurora { position: absolute; inset: 0; }
.blob { position: absolute; border-radius: 50%; }
.b1 { width: 60vmax; height: 60vmax; left: -18vmax; top: -24vmax;
  background: radial-gradient(closest-side, rgba(0, 245, 212, 0.38) 0%, rgba(0, 245, 212, 0.16) 35%, rgba(0, 245, 212, 0) 100%);
  animation: drift1 26s ease-in-out infinite alternate; }
.b2 { width: 56vmax; height: 56vmax; right: -20vmax; top: 4vh;
  background: radial-gradient(closest-side, rgba(255, 46, 151, 0.30) 0%, rgba(255, 46, 151, 0.12) 35%, rgba(255, 46, 151, 0) 100%);
  animation: drift2 32s ease-in-out infinite alternate; }
.b3 { width: 66vmax; height: 46vmax; left: 12vw; bottom: -26vmax;
  background: radial-gradient(closest-side, rgba(106, 61, 255, 0.34) 0%, rgba(106, 61, 255, 0.14) 35%, rgba(106, 61, 255, 0) 100%);
  animation: drift3 38s ease-in-out infinite alternate; }
.b4 { width: 36vmax; height: 36vmax; left: 38vw; top: 22vh;
  background: radial-gradient(closest-side, rgba(0, 180, 255, 0.2) 0%, rgba(0, 180, 255, 0.08) 35%, rgba(0, 180, 255, 0) 100%);
  animation: drift4 30s ease-in-out infinite alternate; }

@keyframes drift1 { to { transform: translate(18vw, 14vh) scale(1.2); } }
@keyframes drift2 { to { transform: translate(-20vw, 18vh) scale(0.85); } }
@keyframes drift3 { to { transform: translate(-22vw, -12vh) scale(1.15); } }
@keyframes drift4 { to { transform: translate(-14vw, 20vh) scale(1.4); } }

/* ---------- 2. neon perspective floor ---------- */
.floor {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 46vh;
  perspective: 420px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0.55) 45%, transparent 100%);
  mask-image: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0.55) 45%, transparent 100%);
}
.grid-plane {
  position: absolute;
  left: -50%; width: 200%;
  top: 0; height: 200%;
  transform-origin: 50% 0;
  transform: rotateX(62deg);
  background-image:
      linear-gradient(rgba(0, 245, 212, 0.55) 1.5px, transparent 1.5px),
      linear-gradient(90deg, rgba(255, 46, 151, 0.42) 1.5px, transparent 1.5px);
  background-size: 64px 64px;
  animation: floor-move 2.6s linear infinite;
}
@keyframes floor-move { to { background-position: 0 64px, 0 0; } }

/* ---------- 3. canvas ---------- */
.stars { position: absolute; inset: 0; width: 100%; height: 100%; }

/* ---------- 4. vignette (dark mode only) ---------- */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(2, 6, 9, 0.72) 100%);
}

/* =====================================================================
   LIGHT THEME  (<html data-theme="light">)
   Same scene, repainted for a bright page: soft pastel clouds, thin
   teal / pink floor lines, dark-teal stars. No white overlay at all.
   ===================================================================== */
.bg-root.light .vignette { display: none; }
.bg-root.light .b1 {
  background: radial-gradient(closest-side, rgba(0, 190, 170, 0.28) 0%, rgba(0, 190, 170, 0.10) 38%, rgba(0, 190, 170, 0) 100%);
}
.bg-root.light .b2 {
  background: radial-gradient(closest-side, rgba(255, 90, 170, 0.22) 0%, rgba(255, 90, 170, 0.08) 38%, rgba(255, 90, 170, 0) 100%);
}
.bg-root.light .b3 {
  background: radial-gradient(closest-side, rgba(130, 100, 255, 0.22) 0%, rgba(130, 100, 255, 0.08) 38%, rgba(130, 100, 255, 0) 100%);
}
.bg-root.light .b4 {
  background: radial-gradient(closest-side, rgba(0, 170, 255, 0.14) 0%, rgba(0, 170, 255, 0.05) 38%, rgba(0, 170, 255, 0) 100%);
}
.bg-root.light .grid-plane {
  background-image:
      linear-gradient(rgba(0, 121, 107, 0.32) 1.5px, transparent 1.5px),
      linear-gradient(90deg, rgba(196, 0, 95, 0.22) 1.5px, transparent 1.5px);
}

/* ---------- small screens: lighter on phones ---------- */
@media (max-width: 700px) {
  .floor { height: 34vh; }
  .grid-plane { background-size: 44px 44px; animation-name: floor-move-sm; }
}
@keyframes floor-move-sm { to { background-position: 0 44px, 0 0; } }

@media (prefers-reduced-motion: reduce) {
  .blob, .grid-plane { animation: none; }
}
</style>