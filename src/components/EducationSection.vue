<script setup lang="ts">
import { education } from '@/data'
import { useInView } from '@/composables/useInView'

const { el, seen } = useInView(0.15)
</script>

<template>
  <section id="education">
    <h2>Educational Background</h2>

    <ol ref="el" class="timeline">
      <li
          v-for="(e, i) in education"
          :key="e.school + e.degree"
          class="item"
          :class="{ in: seen }"
          :style="{ transitionDelay: i * 120 + 'ms' }"
      >
        <span class="dot" aria-hidden="true"></span>
        <article class="card glass">
          <span class="period">{{ e.period }}</span>
          <h3>{{ e.degree }}</h3>
          <b class="school">{{ e.school }}</b>
          <p>{{ e.details }}</p>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline {
  list-style: none; margin: 0; padding: 0 0 0 28px;
  position: relative; display: grid; gap: 20px;
}
.timeline::before {
  content: ''; position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px;
  background: linear-gradient(var(--teal), var(--mag)); opacity: 0.5;
}

.item {
  position: relative;
  opacity: 0; transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.item.in { opacity: 1; transform: none; }

.dot {
  position: absolute; left: -28px; top: 26px;
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--bg); border: 2px solid var(--teal);
  box-shadow: 0 0 12px rgba(0, 245, 212, 0.6);
}

.card { padding: 22px 24px; transition: border-color 0.2s; }
.card:hover { border-color: var(--teal); }

.period { display: block; margin-bottom: 6px; font: 0.75rem var(--mono); color: var(--mag); }
h3 { font-size: 1.1rem; color: var(--ink); }
.school { display: block; margin: 6px 0 10px; font: 600 0.9rem var(--mono); color: var(--teal); }
p { margin: 0; color: var(--mute); }
</style>