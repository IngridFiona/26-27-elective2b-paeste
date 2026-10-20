<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle { x: number; y: number; vx: number; vy: number; r: number }

const canvas = ref<HTMLCanvasElement | null>(null)
const mouse = { x: -999, y: -999 }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
let parts: Particle[] = []
let W = 0
let H = 0
let raf = 0

function resize() {
  const c = canvas.value!
  const d = Math.min(devicePixelRatio || 1, 2)
  W = innerWidth
  H = innerHeight
  c.width = W * d
  c.height = H * d
  c.getContext('2d')!.setTransform(d, 0, 0, d, 0, 0)
  parts = Array.from({ length: Math.min(110, Math.floor((W * H) / 14000)) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.6 + 0.6,
  }))
}

const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
const onLeave = () => { mouse.x = -999; mouse.y = -999 }

function loop() {
  const ctx = canvas.value!.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  for (const p of parts) {
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d = Math.hypot(dx, dy)
    if (d > 0 && d < 140) {
      const f = (140 - d) / 140
      p.vx += (dx / d) * f * 0.25
      p.vy += (dy / d) * f * 0.25
    }
    p.vx *= 0.985
    p.vy *= 0.985
    if (Math.abs(p.vx) + Math.abs(p.vy) < 0.15) {
      p.vx += (Math.random() - 0.5) * 0.05
      p.vy += (Math.random() - 0.5) * 0.05
    }
    if (!reduce) { p.x += p.vx; p.y += p.vy }
    if (p.x < 0 || p.x > W) p.vx *= -1
    if (p.y < 0 || p.y > H) p.vy *= -1
  }

  for (let i = 0; i < parts.length; i++) {
    const a = parts[i]
    for (let j = i + 1; j < parts.length; j++) {
      const b = parts[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < 120) {
        ctx.strokeStyle = `rgba(0,245,212,${(1 - d / 120) * 0.32})`
        ctx.lineWidth = 0.7
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      }
    }
    const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y)
    if (dm < 170) {
      ctx.strokeStyle = `rgba(255,46,151,${(1 - dm / 170) * 0.6})`
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
    }
    ctx.fillStyle = dm < 170 ? '#ff2e97' : '#00f5d4'
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 7); ctx.fill()
    ctx.shadowBlur = 0
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  resize()
  loop()
  addEventListener('resize', resize)
  addEventListener('pointermove', onMove)
  document.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('resize', resize)
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