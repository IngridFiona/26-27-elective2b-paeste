<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { certificates } from '@/data'
import type { Certificate } from '@/types'

const active = ref('All')
const selected = ref<Certificate | null>(null)

const cats = computed(() => ['All', ...new Set(certificates.map((c) => c.category))])

const shown = computed(() =>
    active.value === 'All' ? certificates : certificates.filter((c) => c.category === active.value),
)

const initials = (t: string) => t.split(' ').map((w) => w[0]).join('')
const bg = (c: Certificate) => `linear-gradient(135deg, ${c.c1}, ${c.c2})`

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') selected.value = null
}

onMounted(() => addEventListener('keydown', onKey))
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <section id="certs">
    <h2>Achievements and Certificates</h2>

    <div class="filters">
      <button
          v-for="c in cats"
          :key="c"
          :class="{ on: c === active }"
          @click="active = c"
      >
        {{ c }}
      </button>
    </div>

    <TransitionGroup name="list" tag="div" class="grid">
      <button
          v-for="c in shown"
          :key="c.id"
          class="cert glass"
          @click="selected = c"
      >
        <div class="thumb" :style="!c.image ? { background: bg(c) } : {}">
          <img v-if="c.image" :src="c.image" :alt="c.title" />
          <span v-else>{{ initials(c.title) }}</span>
        </div>
        <div class="meta">
          <div class="meta-top">
            <b>{{ c.title }}</b>
            <span class="issuer">{{ c.issuer }}</span>
          </div>
          <small class="date">{{ c.year }}</small>
        </div>
      </button>
    </TransitionGroup>

    <Teleport to="body">
      <div v-if="selected" class="modal" role="dialog" aria-modal="true" @click.self="selected = null">
        <button class="x" aria-label="Close preview" @click="selected = null">×</button>
        <div class="sheet" :style="!selected.image ? { background: bg(selected) } : {}">
          <img v-if="selected.image" :src="selected.image" :alt="selected.title" class="modal-img" />
          <template v-else>
            <small>CERTIFICATE OF COMPLETION</small>
            <h3>{{ selected.title }}</h3>
            <p>Awarded by {{ selected.issuer }} · {{ selected.year }}</p>
          </template>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

.filters button {
  font: 0.82rem var(--mono);
  padding: 8px 16px;
  border-radius: 99px;
  background: none;
  color: var(--mute);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: 0.2s;
}

.filters button.on, .filters button:hover {
  color: var(--teal);
  border-color: var(--teal);
  box-shadow: 0 0 14px rgba(0, 245, 212, 0.3);
}

.cert {
  padding: 0;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s, border-color 0.2s;
  overflow: hidden;
  border-radius: 14px;
}

.cert:hover {
  border-color: var(--mag);
  transform: translateY(-4px);
}

.thumb {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 13px 13px 0 0;
  font: 700 2.4rem var(--mono);
  color: rgba(255, 255, 255, 0.85);
  background: #06151a;
  flex-shrink: 0;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.meta {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  gap: 12px;
}

.meta-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta b {
  display: block;
  font: 600 0.95rem var(--mono);
  line-height: 1.4;
}

.issuer {
  color: var(--mute);
  font: 0.85rem var(--sans);
  display: block;
}

.date {
  color: var(--mute);
  font: 0.78rem var(--mono);
  display: block;
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 6, 8, 0.88);
  backdrop-filter: blur(8px);
}

.sheet {
  width: min(780px, 100%);
  max-height: 85vh;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px solid var(--teal);
  box-shadow: 0 0 60px rgba(0, 245, 212, 0.35);
  animation: pop 0.3s ease-out;
  overflow: hidden;
  background: #06151a;
}

.modal-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.sheet h3 {
  font-size: clamp(1.2rem, 4vw, 2.2rem);
  margin: 10px 0;
}

.sheet small {
  font-family: var(--mono);
}

.sheet p {
  margin: 0;
}

@keyframes pop {
  from { transform: scale(0.9); opacity: 0; }
}

.x {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 44px;
  height: 44px;
  font: 1.4rem var(--mono);
  color: var(--teal);
  background: none;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  z-index: 60;
}
</style>