<script setup lang="ts">
import { education } from '@/data'
</script>

<template>
  <section id="education">
    <h2>Education</h2>
    <ol class="timeline">
      <li v-for="e in education" :key="e.school" class="item">
        <span class="node" />
        <div class="card glass">
          <small class="period">{{ e.period }}</small>
          <h3>{{ e.degree }}</h3>
          <p class="school">{{ e.school }}</p>
          <p class="details">{{ e.details }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline {
  position: relative; margin: 0; padding: 0 0 0 34px; list-style: none;
  display: grid; gap: 22px;
}
.timeline::before {
  content: ''; position: absolute; left: 9px; top: 6px; bottom: 6px; width: 2px;
  background: linear-gradient(var(--teal), var(--mag));
  box-shadow: 0 0 12px var(--teal);
}
.item { position: relative; }
.node {
  position: absolute; left: -34px; top: 22px; width: 20px; height: 20px; border-radius: 50%;
  background: var(--bg); border: 2px solid var(--teal);
  box-shadow: 0 0 14px var(--teal);
}
.node::after {
  content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--mag);
}
.card { padding: 22px 24px; transition: border-color 0.2s, transform 0.25s; }
.card:hover { border-color: var(--teal); transform: translateX(6px); }
.period { font: 0.75rem var(--mono); color: var(--mag); }
h3 { font-size: 1.1rem; margin: 6px 0 4px; }
.school { margin: 0 0 10px; font: 0.88rem var(--mono); color: var(--teal); }
.details { margin: 0; color: var(--mute); }
</style>