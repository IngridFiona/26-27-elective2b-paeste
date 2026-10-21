<script setup lang="ts">
/*
  LIVE CIRCUIT BOARD BACKGROUND
  - A random PCB-style trace layout is drawn once (45° and 90° routing, pads + vias).
  - Light pulses ("signals") constantly travel along the traces.
  - Your cursor works like a probe: nearby traces light up and send out fast pulses.
  - Follows the dark / light theme automatically.
*/
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Trace { pts: number[]; cum: number[]; total: number }
interface Seg { x1: number; y1: number; x2: number; y2: number; mx: number; my: number; tr: number; at: number }
interface Pulse { trace: number; d: number; dir: 1 | -1; speed: number; hot: boolean }
interface Pad { x: number; y: number; via: boolean }

/* ---------- settings you can tweak ---------- */
const GRID = 26          // distance between routing points (px). Bigger = fewer, longer traces
const DENSITY = 20000    // px² per trace. Smaller number = more traces
const TRAIL = 14         // length of a pulse's glowing tail
const STEP = 5           // spacing of tail samples (px)
const MAX_PULSES = 60

const canvas = ref<HTMLCanvasElement | null>(null)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const mouse = { x: -999, y: -999 }

let ctx: CanvasRenderingContext2D | null = null
let layer: HTMLCanvasElement | null = null
let spriteLine: HTMLCanvasElement | null = null
let spriteHot: HTMLCanvasElement | null = null

let W = 0
let H = 0
let dpr = 1
let raf = 0
let resizeTimer = 0
let observer: MutationObserver | null = null

let traces: Trace[] = []
let segs: Seg[] = []
let pads: Pad[] = []
let pulses: Pulse[] = []
let target = 10

let light = false
let lineRgb = '0,245,212'
let hotRgb = '255,46,151'

let lastT = 0
let lastSpawn = 0
let lastMove = 0

/* ---------- small helpers (keep TypeScript's strict index checks happy) ---------- */
const v = (a: ArrayLike<number>, i: number): number => a[i] ?? 0

const DIRS: Array<[number, number]> = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
]
function dirOf(i: number): [number, number] {
  return DIRS[((i % 8) + 8) % 8] ?? [1, 0]
}

function pointAt(tr: Trace, d: number): [number, number] {
  const n = tr.cum.length
  const dd = Math.max(0, Math.min(tr.total, d))
  let i = 1
  while (i < n - 1 && v(tr.cum, i) < dd) i++
  const c0 = v(tr.cum, i - 1)
  const c1 = v(tr.cum, i)
  const t = c1 > c0 ? (dd - c0) / (c1 - c0) : 0
  const x0 = v(tr.pts, (i - 1) * 2)
  const y0 = v(tr.pts, (i - 1) * 2 + 1)
  const x1 = v(tr.pts, i * 2)
  const y1 = v(tr.pts, i * 2 + 1)
  return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
}

/* ---------- build the board ---------- */
function build() {
  const cols = Math.ceil(W / GRID) + 1
  const rows = Math.ceil(H / GRID) + 1
  const used = new Uint8Array(cols * rows)
  const isFree = (cx: number, cy: number) =>
      cx >= 0 && cy >= 0 && cx < cols && cy < rows && used[cy * cols + cx] === 0
  const setUsed = (cx: number, cy: number, val: number) => { used[cy * cols + cx] = val }

  traces = []
  segs = []
  pads = []

  const want = Math.min(160, Math.floor((W * H) / DENSITY))
  let tries = want * 8

  while (traces.length < want && tries-- > 0) {
    let cx = Math.floor(Math.random() * cols)
    let cy = Math.floor(Math.random() * rows)
    if (!isFree(cx, cy)) continue

    let dir = Math.floor(Math.random() * 8)
    const steps = 5 + Math.floor(Math.random() * 18)
    const cells: Array<[number, number]> = [[cx, cy]]
    setUsed(cx, cy, 1)

    for (let s = 0; s < steps; s++) {
      if (Math.random() < 0.2) dir += Math.random() < 0.5 ? 1 : -1
      let moved = false
      for (const turn of [0, 1, -1]) {
        const [dx, dy] = dirOf(dir + turn)
        const nx = cx + dx
        const ny = cy + dy
        if (!isFree(nx, ny)) continue
        // diagonal moves must not cut across another trace
        if (dx !== 0 && dy !== 0 && (!isFree(cx + dx, cy) || !isFree(cx, cy + dy))) continue
        dir += turn
        cx = nx
        cy = ny
        setUsed(cx, cy, 1)
        cells.push([cx, cy])
        moved = true
        break
      }
      if (!moved) break
    }

    // too short: give the cells back
    if (cells.length < 5) {
      for (const c of cells) setUsed(c[0], c[1], 0)
      continue
    }

    const pts: number[] = []
    const cum: number[] = [0]
    let total = 0
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i]
      if (!c) continue
      const x = c[0] * GRID
      const y = c[1] * GRID
      if (i > 0) {
        const px = v(pts, (i - 1) * 2)
        const py = v(pts, (i - 1) * 2 + 1)
        total += Math.hypot(x - px, y - py)
        cum.push(total)
        segs.push({
          x1: px, y1: py, x2: x, y2: y,
          mx: (px + x) / 2, my: (py + y) / 2,
          tr: traces.length, at: i - 1,
        })
      }
      pts.push(x, y)
    }

    pads.push({ x: v(pts, 0), y: v(pts, 1), via: false })
    pads.push({ x: v(pts, pts.length - 2), y: v(pts, pts.length - 1), via: true })
    traces.push({ pts, cum, total })
  }

  target = Math.max(8, Math.min(26, Math.round(traces.length * 0.16)))
}

/* ---------- drawing the static board (once, on an offscreen canvas) ---------- */
function paintLayer() {
  if (!layer) layer = document.createElement('canvas')
  layer.width = Math.floor(W * dpr)
  layer.height = Math.floor(H * dpr)
  const g = layer.getContext('2d')
  if (!g) return
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, W, H)
  g.lineJoin = 'round'
  g.lineCap = 'round'

  g.strokeStyle = `rgba(${lineRgb},${light ? 0.17 : 0.11})`
  g.lineWidth = 1.2
  for (const tr of traces) {
    g.beginPath()
    for (let i = 0; i < tr.pts.length; i += 2) {
      const x = v(tr.pts, i)
      const y = v(tr.pts, i + 1)
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
  }

  for (const p of pads) {
    g.beginPath()
    g.arc(p.x, p.y, p.via ? 3.4 : 2.6, 0, Math.PI * 2)
    if (p.via) {
      g.strokeStyle = `rgba(${lineRgb},${light ? 0.42 : 0.3})`
      g.lineWidth = 1.2
      g.stroke()
    } else {
      g.fillStyle = `rgba(${lineRgb},${light ? 0.48 : 0.36})`
      g.fill()
    }
  }
}

function makeSprite(rgb: string, strength: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const g = c.getContext('2d')
  if (g) {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, `rgba(${rgb},${strength})`)
    grd.addColorStop(0.35, `rgba(${rgb},${strength * 0.35})`)
    grd.addColorStop(1, `rgba(${rgb},0)`)
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
  }
  return c
}

/* colors follow the theme (<html data-theme="light|dark">) */
function readTheme() {
  light = document.documentElement.dataset.theme === 'light'
  lineRgb = light ? '0,121,107' : '0,245,212'
  hotRgb = light ? '196,0,95' : '255,46,151'
  spriteLine = makeSprite(lineRgb, light ? 0.55 : 0.95)
  spriteHot = makeSprite(hotRgb, light ? 0.5 : 0.9)
  paintLayer()
}

/* ---------- pulses ---------- */
function spawn(hot: boolean, ti?: number, from?: number) {
  if (!traces.length) return
  const index = ti ?? Math.floor(Math.random() * traces.length)
  const tr = traces[index]
  if (!tr) return
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1
  const d = from ?? (dir === 1 ? 0 : tr.total)
  pulses.push({
    trace: index,
    d,
    dir,
    speed: hot ? 300 : 70 + Math.random() * 110,
    hot,
  })
  if (pulses.length > MAX_PULSES) pulses.shift()
}

/* ---------- setup / loop ---------- */
function drawStatic() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  if (layer) ctx.drawImage(layer, 0, 0, W, H)
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

  build()
  readTheme()

  pulses = []
  for (let i = 0; i < target; i++) spawn(false, undefined, Math.random() * 200)
  if (reduce) drawStatic()
}

function frame(t: number) {
  raf = requestAnimationFrame(frame)
  const g = ctx
  if (!g || !spriteLine || !spriteHot) return

  const dt = Math.min(0.05, Math.max(0, (t - lastT) / 1000))
  lastT = t

  g.clearRect(0, 0, W, H)
  if (layer) g.drawImage(layer, 0, 0, W, H)
  g.globalCompositeOperation = light ? 'source-over' : 'lighter'
  g.lineCap = 'round'

  /* cursor probe: nearby traces light up */
  if (mouse.x > -500) {
    const R = 200
    const R2 = R * R
    let nearest: Seg | null = null
    let nearD = Infinity
    g.lineWidth = 1.4
    for (const s of segs) {
      const dx = s.mx - mouse.x
      const dy = s.my - mouse.y
      const d2 = dx * dx + dy * dy
      if (d2 > R2) continue
      if (d2 < nearD) { nearD = d2; nearest = s }
      const a = Math.pow(1 - Math.sqrt(d2) / R, 1.6) * 0.85
      g.strokeStyle = `rgba(${hotRgb},${a.toFixed(3)})`
      g.beginPath()
      g.moveTo(s.x1, s.y1)
      g.lineTo(s.x2, s.y2)
      g.stroke()
    }

    // moving the mouse shoots fast pulses down the closest trace
    if (nearest && t - lastMove < 140 && t - lastSpawn > 260) {
      lastSpawn = t
      const tr = traces[nearest.tr]
      if (tr) spawn(true, nearest.tr, v(tr.cum, nearest.at))
    }

    // soft glow + probe ring
    g.globalAlpha = light ? 0.16 : 0.28
    g.drawImage(spriteHot, mouse.x - 80, mouse.y - 80, 160, 160)
    g.globalAlpha = 1
    g.strokeStyle = `rgba(${hotRgb},0.6)`
    g.lineWidth = 1
    g.beginPath()
    g.arc(mouse.x, mouse.y, 11, 0, Math.PI * 2)
    g.moveTo(mouse.x - 22, mouse.y); g.lineTo(mouse.x - 15, mouse.y)
    g.moveTo(mouse.x + 15, mouse.y); g.lineTo(mouse.x + 22, mouse.y)
    g.moveTo(mouse.x, mouse.y - 22); g.lineTo(mouse.x, mouse.y - 15)
    g.moveTo(mouse.x, mouse.y + 15); g.lineTo(mouse.x, mouse.y + 22)
    g.stroke()
  }

  /* signals travelling along the traces */
  const tail = TRAIL * STEP
  const alive: Pulse[] = []
  let calm = 0

  for (const p of pulses) {
    const tr = traces[p.trace]
    if (!tr) continue

    p.d += p.dir * p.speed * dt
    const over = p.dir === 1 ? p.d - tr.total : -p.d
    if (over > tail) continue // finished
    alive.push(p)
    if (!p.hot) calm++

    const fade = over > 0 ? 1 - over / tail : 1
    const rgb = p.hot ? hotRgb : lineRgb
    g.globalAlpha = fade

    let prev = pointAt(tr, p.d)
    for (let k = 1; k <= TRAIL; k++) {
      const cur = pointAt(tr, p.d - p.dir * k * STEP)
      const f = 1 - k / TRAIL
      g.strokeStyle = `rgba(${rgb},${(f * 0.9).toFixed(3)})`
      g.lineWidth = 0.6 + f * 1.8
      g.beginPath()
      g.moveTo(prev[0], prev[1])
      g.lineTo(cur[0], cur[1])
      g.stroke()
      prev = cur
    }

    const head = pointAt(tr, p.d)
    g.drawImage(p.hot ? spriteHot : spriteLine, head[0] - 15, head[1] - 15, 30, 30)
  }

  g.globalAlpha = 1
  g.globalCompositeOperation = 'source-over'

  pulses = alive
  while (calm < target && traces.length) { spawn(false); calm++ }
}

/* ---------- events ---------- */
const onMove = (e: PointerEvent) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
  lastMove = performance.now()
}
const onLeave = () => { mouse.x = -999; mouse.y = -999 }

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
  document.addEventListener('pointerleave', onLeave)

  observer = new MutationObserver(() => {
    readTheme()
    if (reduce) drawStatic()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  observer?.disconnect()
  removeEventListener('resize', onResize)
  removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <canvas ref="canvas" class="bg" aria-hidden="true" />
</template>

<style scoped>
.bg { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; }
</style>