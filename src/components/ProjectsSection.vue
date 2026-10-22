<script setup lang="ts">
import { projects } from '@/data'
import { useInView } from '@/composables/useInView'
import ProjectCard from '@/components/ProjectCard.vue'

const { el, seen } = useInView(0.15)
</script>

<template>
  <section id="projects">
    <h2>Featured Projects</h2>
    <p class="lead">Projects I made for my courses.</p>

    <div ref="el" class="grid">
      <!-- the fade-in sits on this wrapper so it never fights the card's tilt effect -->
      <div
          v-for="(p, i) in projects"
          :key="p.title"
          class="slot"
          :class="{ in: seen }"
          :style="{ transitionDelay: i * 90 + 'ms' }"
      >
        <ProjectCard :project="p" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.lead { margin: -14px 0 26px; color: var(--mute); font: 0.9rem var(--mono); }

.slot {
  opacity: 0; transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.slot.in { opacity: 1; transform: none; }
.slot > * { height: 100%; }
</style>