<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { phrases, profile, socials, techPills } from '@/data'

/* Edit these */
const tagline = 'eOwZz p0e! w3lC0m3 t0 mY p0rtF0l10, c0mpUtEr 3ng1n33r1ng stUd3nt h3r3! pRoUd cSu c4r1g stUd3nt!'

const badges = [
  { label: 'Vue', style: { top: '8%', left: '2%', animationDelay: '0s' } },
  { label: 'TS', style: { top: '22%', right: '-2%', animationDelay: '-1.2s' } },
  { label: 'JS', style: { bottom: '14%', right: '2%', animationDelay: '-2.4s' } },
  { label: '</>', style: { bottom: '22%', left: '-2%', animationDelay: '-3.6s' } },
]

/* Floating pills: each one gets its own offset and drift path */
const rows = [0, 18, -8, 24, 6, -14, 16, -4, 20, -10]
const pathX1 = [14, -16, 10, -12, 18, -9, 15, -19, 9, -13]
const pathY1 = [-10, 12, -15, 9, -8, 13, -12, 8, -16, 10]
const pathX2 = [-15, 12, -13, 16, -10, 15, -18, 10, -12, 16]
const pathY2 = [9, -13, 10, -12, 15, -9, 12, -15, 8, -10]

const pillStyle = (i: number) => {
  const k = i % 10
  return {
    '--top': `${rows[k]}px`,
    '--x1': `${pathX1[k]}px`, '--y1': `${pathY1[k]}px`,
    '--x2': `${pathX2[k]}px`, '--y2': `${pathY2[k]}px`,
    '--dur': `${7 + (i % 5) * 1.3}s`,
    '--delay': `${-(i * 1.7).toFixed(1)}s`,
    '--in': `${i * 70}ms`,
  }
}

/* Typewriter */
const typed = ref('')
let timer = 0
let pi = 0
let ci = 0
let deleting = false

function tick() {
  const s = phrases[pi] ?? ''
  typed.value = s.slice(0, ci)

  if (!deleting && ci === s.length) {
    deleting = true
    timer = window.setTimeout(tick, 1600)
    return
  }
  if (deleting && ci === 0) {
    deleting = false
    pi = (pi + 1) % phrases.length
  }
  ci += deleting ? -1 : 1
  timer = window.setTimeout(tick, deleting ? 30 : 70)
}

onMounted(() => {
  tick()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section id="hero">
    <div class="copy">
      <h1>Hi, I’m <span>{{ profile.name }}</span></h1>
      <div class="type">{{ typed }}</div>
      <p class="sub">{{ tagline }}</p>

      <div class="follow">
        <span class="follow-label">Follow me:</span>
        <a
            v-for="s in socials"
            :key="s.name"
            class="social"
            :href="s.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="s.name"
            :title="s.name"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="s.path" /></svg>
        </a>
      </div>

      <div class="actions">
        <a class="btn" href="/cv.jpg" download="My-CV.jpg">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
          Download CV
        </a>
        <a class="btn alt" href="#contact">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18v12H3zM3 7l9 7 9-7" />
          </svg>
          Contact Me
        </a>
      </div>

      <!-- floating tech pills -->
      <div class="pills" aria-label="Technologies I work with">
        <span v-for="(t, i) in techPills" :key="t" class="pill" :style="pillStyle(i)">{{ t }}</span>
      </div>
    </div>

    <div class="visual">
      <div class="photo">
        <img src="/me.jpg" :alt="'Portrait of ' + profile.name">
      </div>
      <span v-for="b in badges" :key="b.label" class="badge" :style="b.style">{{ b.label }}</span>
    </div>
  </section>
</template>

<style scoped>
#hero {
  max-width: 1240px; min-height: 100vh; min-height: 100svh;
  padding: 110px 28px 40px;
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center;
}

/* Left */
h1 { font-size: clamp(2rem, 5.2vw, 3.8rem); letter-spacing: -0.02em; margin: 0 0 14px; }
h1 span { color: var(--teal); text-shadow: 0 0 28px rgba(0, 245, 212, 0.55); }
.type { font: clamp(1.2rem, 3vw, 1.8rem) var(--mono); min-height: 1.8em; color: var(--ink); }
.type::after { content: '▌'; color: var(--mag); animation: pulse 1s infinite; }
.sub { margin: 14px 0 26px; color: var(--mute); font-size: 1.1rem; max-width: 520px; }
@keyframes pulse { 50% { opacity: 0.25; } }

.follow { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 26px; }
.follow-label { font: 600 0.9rem var(--mono); color: var(--ink); margin-right: 4px; }
.social {
  width: 46px; height: 46px; display: grid; place-items: center;
  border-radius: 50%; color: var(--teal);
  background: var(--glass); border: 1px solid var(--line);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
}
.social svg { width: 20px; height: 20px; fill: currentColor; }
.social:hover {
  color: var(--mag); border-color: var(--mag);
  box-shadow: 0 0 18px rgba(255, 46, 151, 0.5); transform: translateY(-3px);
}

.actions { display: flex; flex-wrap: wrap; gap: 14px; }
.actions .btn { display: inline-flex; align-items: center; gap: 10px; margin: 0; }
.ico { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

/* floating tech pills */
.pills {
  display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center;
  gap: 26px 30px; padding: 6px 0; min-height: 150px;
  margin-top: 34px; max-width: 640px;
}
.pill {
  font: 0.8rem var(--mono); color: var(--teal);
  padding: 9px 20px; border-radius: 99px; white-space: nowrap;
  background: rgba(8, 28, 32, 0.9); border: 1px solid var(--line);
  box-shadow: 0 0 14px rgba(0, 245, 212, 0.15);
  margin-top: var(--top);
  animation:
      pill-in 0.7s ease both,
      drift var(--dur) ease-in-out infinite;
  animation-delay: var(--in), var(--delay);
  transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
}
.pill:hover {
  color: var(--ink); border-color: var(--teal);
  box-shadow: 0 0 22px rgba(0, 245, 212, 0.55);
  animation-play-state: paused;
}
@keyframes pill-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes drift {
  0%   { transform: translate(0, 0); }
  33%  { transform: translate(var(--x1), var(--y1)); }
  66%  { transform: translate(var(--x2), var(--y2)); }
  100% { transform: translate(0, 0); }
}

/* Right: circle photo */
.visual { position: relative; width: min(440px, 86vw); aspect-ratio: 1; margin: 0 auto; }
.photo {
  position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
  border: 5px solid rgba(216, 243, 240, 0.9);
  box-shadow:
      0 0 0 6px rgba(0, 245, 212, 0.18),
      0 0 60px rgba(0, 245, 212, 0.45),
      0 0 120px rgba(255, 46, 151, 0.22);
  background: #071a1f;
}
.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.visual::before {
  content: ''; position: absolute; inset: -18px; border-radius: 50%;
  border: 1px dashed rgba(0, 245, 212, 0.4);
  animation: spin 40s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.badge {
  position: absolute; width: 56px; height: 56px; display: grid; place-items: center;
  border-radius: 50%; font: 700 0.85rem var(--mono); color: var(--teal);
  background: rgba(10, 30, 34, 0.9); border: 1px solid var(--line);
  box-shadow: 0 0 18px rgba(0, 245, 212, 0.3);
  animation: float 5s ease-in-out infinite;
}
@keyframes float { 50% { transform: translateY(-12px); } }

@media (max-width: 900px) {
  #hero { grid-template-columns: 1fr; gap: 30px; padding-top: 100px; }
  .visual { order: -1; width: min(300px, 70vw); }
  .pills { justify-content: center; margin-left: auto; margin-right: auto; }
}
@media (max-width: 600px) {
  .pills { gap: 22px 16px; }
  .pill { font-size: 0.75rem; padding: 8px 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .pill { animation: pill-in 0.01s both; }
}
</style>