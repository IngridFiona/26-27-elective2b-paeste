<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useConfetti } from '@/composables/useConfetti'

const contacts = [
  { label: 'EMAIL', value: 'anoifmendoza@gmail.com', href: 'mailto:anoifmendoza@gmail.com' },
  { label: 'PHONE', value: '+639773654699', href: 'tel:+639773654699' },
]

const form = reactive({ name: '', email: '', message: '' })
const status = ref('')
const { burst } = useConfetti()

function onSubmit(e: SubmitEvent) {
  const target = (e.submitter ?? e.target) as HTMLElement
  const r = target.getBoundingClientRect()
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    burst(r.left + r.width / 2, r.top + r.height / 2)
  }
  const first = form.name.split(' ')[0]
  status.value = `Message sent. Thanks, ${first}! I’ll reply as soon as I can.`
  Object.assign(form, { name: '', email: '', message: '' })
}
</script>

<template>
  <section id="contact">
    <h2>Contact</h2>

    <div class="layout">
      <div class="info">
        <p class="lead">
          Have a question? Send me an email or call me and I’ll reply as soon as I can.
        </p>

        <a v-for="c in contacts" :key="c.label" class="row glass" :href="c.href">
          <span class="label">{{ c.label }}</span>
          <span class="value">{{ c.value }}</span>
        </a>
      </div>

      <form class="glass" @submit.prevent="onSubmit">
        <h3>Send us an email</h3>
        <label>Name<input v-model="form.name" required autocomplete="name"></label>
        <label>Email<input v-model="form.email" type="email" required autocomplete="email"></label>
        <label>Message<textarea v-model="form.message" rows="4" required /></label>
        <button class="btn" type="submit">Send message</button>
        <p class="ok" role="status">{{ status }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid; gap: 28px; align-items: start;
  grid-template-columns: 1fr 1fr;
}

/* Left: contact info */
.lead { margin: 0 0 22px; max-width: 460px; color: var(--mute); }

.row {
  display: flex; align-items: center; gap: 24px;
  margin-bottom: 16px; padding: 20px 24px;
  text-decoration: none; color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s;
}
.row:hover {
  border-color: var(--teal);
  box-shadow: 0 0 22px rgba(0, 245, 212, 0.25);
  transform: translateX(6px);
}
.label { min-width: 56px; font: 0.8rem var(--mono); letter-spacing: 0.1em; color: var(--mag); }
.value { font: 600 1rem var(--mono); color: var(--teal); overflow-wrap: anywhere; }
.row:hover .value { text-shadow: 0 0 12px var(--teal); }

/* Right: form */
form { display: grid; gap: 16px; padding: 26px; }
h3 { font-size: 1.1rem; color: var(--teal); }
label { display: grid; gap: 6px; font: 0.8rem var(--mono); color: var(--mute); }
input, textarea {
  width: 100%; padding: 12px; font: 1rem var(--sans); color: var(--ink);
  background: rgba(0, 0, 0, 0.35); border: 1px solid var(--line); border-radius: 10px;
}
input:focus, textarea:focus {
  outline: none; border-color: var(--teal); box-shadow: 0 0 14px rgba(0, 245, 212, 0.3);
}
.btn { justify-self: start; }
.ok { margin: 0; min-height: 1.4em; font: 0.9rem var(--mono); color: var(--teal); }

@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .row { flex-direction: column; align-items: flex-start; gap: 6px; }
}
</style>