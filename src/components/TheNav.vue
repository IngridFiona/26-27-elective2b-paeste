<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data'

const open = ref(false)
const current = ref('hero')

const links = [
  { id: 'hero', label: 'Home', icon: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z' },
  { id: 'about', label: 'About', icon: 'M3 5h18v14H3zM9 11a2 2 0 100-4 2 2 0 000 4zM5.5 16c.6-2.2 6.4-2.2 7 0M15 9h3M15 13h3' },
  { id: 'education', label: 'Education', icon: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5' },
  { id: 'skills', label: 'Skills', icon: 'M8 7l-5 5 5 5M16 7l5 5-5 5' },
  { id: 'certs', label: 'Certificates', icon: 'M12 14a6 6 0 100-12 6 6 0 000 12zM8.5 13L7 22l5-3 5 3-1.5-9' },
  { id: 'contact', label: 'Contact', icon: 'M3 6h18v12H3zM3 7l9 7 9-7' },
]

function onScroll() {
  let cur = 'hero'
  for (const l of links) {
    const el = document.getElementById(l.id)
    if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = l.id
  }
  current.value = cur
}

onMounted(() => {
  onScroll()
  addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
</script>

<template>
  <nav>
    <div class="in">
      <a class="logo" href="#hero">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>
        {{ profile.name }}
      </a>

      <button class="burger" aria-label="Toggle menu" :aria-expanded="open" @click="open = !open">☰</button>

      <div class="links" :class="{ open }">
        <a
            v-for="l in links"
            :key="l.id"
            :href="'#' + l.id"
            :class="{ on: current === l.id }"
            @click="open = false"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="l.icon" /></svg>
          {{ l.label }}
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 20;
  background: rgba(4, 9, 12, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}

/* full width: name at the far left, links at the far right */
.in {
  width: 100%; height: 72px; margin: 0; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
}

.logo {
  display: inline-flex; align-items: center; gap: 10px; flex-shrink: 0;
  font: 700 1.25rem var(--mono); color: var(--teal);
  text-decoration: none; text-shadow: 0 0 14px rgba(0, 245, 212, 0.45);
}
.logo svg { width: 24px; height: 24px; }

.links { display: flex; gap: 6px; height: 100%; }
.links a {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 16px; height: 100%;
  font: 500 0.9rem var(--mono); color: var(--mute); text-decoration: none;
  border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s;
}
.links a:hover { color: var(--ink); }
.links a.on {
  color: var(--teal); border-bottom-color: var(--teal);
  text-shadow: 0 0 10px rgba(0, 245, 212, 0.6);
}

svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.links svg { width: 18px; height: 18px; }

.burger {
  display: none; background: none; color: var(--teal); cursor: pointer;
  border: 1px solid var(--line); border-radius: 8px; padding: 7px 11px; font: inherit;
}

@media (max-width: 960px) {
  .in { padding: 0 18px; }
  .burger { display: block; }
  .links {
    position: fixed; top: 80px; left: 12px; right: 12px; height: auto;
    flex-direction: column; gap: 0; padding: 8px;
    background: rgba(4, 9, 12, 0.96);
    border: 1px solid var(--line); border-radius: 14px;
    transform: translateY(-12px); opacity: 0; pointer-events: none;
    transition: 0.25s;
  }
  .links.open { transform: none; opacity: 1; pointer-events: auto; }
  .links a { height: auto; padding: 14px; border-bottom: none; border-radius: 10px; }
  .links a.on { background: rgba(0, 245, 212, 0.08); }
}
</style>