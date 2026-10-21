<script setup lang="ts">
import { ref } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import ParticleCanvas from '@/components/ParticleCanvas.vue'
import TheNav from '@/components/TheNav.vue'
import TheHud from '@/components/TheHud.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import EducationSection from '@/components/EducationSection.vue'
import SkillsSection from '@/components/SkillsSection.vue'
import CertificatesSection from '@/components/CertificatesSection.vue'
import ContactForm from '@/components/ContactForm.vue'
import GlitchFX from '@/components/GlitchFX.vue'

const loading = ref(true)
</script>

<template>
  <Transition name="boot">
    <LoadingScreen v-if="loading" @done="loading = false" />
  </Transition>

  <template v-if="!loading">
    <ParticleCanvas />
    <TheNav />
    <TheHud />
    <main>
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <SkillsSection />
      <CertificatesSection />
      <ContactForm />
    </main>
    <footer>© 2026 Ingrid Fiona Paeste. Built with Vue, TypeScript and too much coffee.</footer>
    <GlitchFX />
  </template>
</template>

<style scoped>
footer {
  position: relative; z-index: 2; text-align: center;
  padding: 60px 20px 90px; color: var(--mute); font: 0.8rem var(--mono);
}
.boot-leave-active { transition: opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease; }
.boot-leave-to { opacity: 0; transform: scale(1.05); filter: blur(8px); }
</style>