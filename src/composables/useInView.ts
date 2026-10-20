import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useInView(threshold = 0.35) {
    const el = ref<HTMLElement | null>(null)
    const seen = ref(false)
    let io: IntersectionObserver | undefined

    onMounted(() => {
        io = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                seen.value = true
                io?.disconnect()
            }
        }, { threshold })

        if (el.value) io.observe(el.value)
    })

    onBeforeUnmount(() => io?.disconnect())

    return { el, seen }
}