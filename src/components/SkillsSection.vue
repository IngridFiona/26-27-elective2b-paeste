<script setup lang="ts">
import { skillGroups } from '@/data'
import { useInView } from '@/composables/useInView'

const { el, seen } = useInView()
</script>

<template>
  <section id="skills">
    <h2>Skills</h2>

    <div ref="el" class="groups">
      <div v-for="g in skillGroups" :key="g.title" class="group glass">
        <h3>{{ g.title }}</h3>
        <ul class="tags">
          <li
              v-for="(item, i) in g.items"
              :key="item"
              class="tag"
              :class="{ in: seen }"
              :style="{ transitionDelay: i * 60 + 'ms' }"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.groups {
  display: grid; gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.group { padding: 26px; }
.group h3 {
  margin: 0 0 18px; font: 700 1.1rem var(--mono); color: var(--teal);
  text-shadow: 0 0 14px rgba(0, 245, 212, 0.45);
}
.group h3::before { content: '> '; color: var(--mag); }

.tags { display: flex; flex-wrap: wrap; gap: 10px; margin: 0; padding: 0; list-style: none; }

.tag {
  font: 0.85rem var(--mono); padding: 8px 16px; border-radius: 99px;
  color: var(--ink); background: rgba(0, 245, 212, 0.07);
  border: 1px solid var(--line);
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.5s, transform 0.5s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
}
.tag.in { opacity: 1; transform: none; }
.tag:hover {
  color: var(--teal); border-color: var(--teal);
  box-shadow: 0 0 14px rgba(0, 245, 212, 0.35);
  transition-delay: 0s;
}
</style>