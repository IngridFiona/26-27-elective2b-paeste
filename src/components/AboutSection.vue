<script setup lang="ts">
import { about } from '@/data'
import { vTilt } from '@/directives/tilt'
</script>

<template>
  <section id="about">
    <h2>About</h2>
    <div class="wrap">
      <div class="bio glass">
        <p v-for="(p, i) in about.paragraphs" :key="i">{{ p }}</p>
      </div>

      <div class="facts">
        <div v-for="f in about.facts" :key="f.label" v-tilt class="fact glass">
          <small>{{ f.label }}</small>
          <b>{{ f.value }}</b>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wrap { display: grid; gap: 22px; grid-template-columns: 1.4fr 1fr; align-items: start; }
.bio { padding: 26px; }
.bio p { margin: 0 0 14px; color: var(--mute); }
.bio p:first-child { color: var(--ink); }
.bio p:last-child { margin-bottom: 0; }

.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.fact {
  position: relative; overflow: hidden; padding: 18px;
  transition: transform 0.15s ease-out, border-color 0.2s;
  --mx: 50%; --my: 50%;
}
.fact::before {
  content: ''; position: absolute; inset: 0; opacity: 0; pointer-events: none;
  background: radial-gradient(180px circle at var(--mx) var(--my), rgba(0, 245, 212, 0.22), transparent 65%);
  transition: opacity 0.25s;
}
.fact:hover { border-color: var(--teal); }
.fact:hover::before { opacity: 1; }
.fact small { display: block; font: 0.72rem var(--mono); color: var(--mute); margin-bottom: 6px; }
.fact b { font: 600 1rem var(--mono); color: var(--teal); }

@media (max-width: 800px) {
  .wrap { grid-template-columns: 1fr; }
}
</style>