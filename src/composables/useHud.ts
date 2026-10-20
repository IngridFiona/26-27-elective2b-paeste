import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useHud() {
    const scroll = ref(0)
    const fps = ref(60)
    const clock = ref('--:--:--')

    let frames = 0
    let last = performance.now()
    let raf = 0
    let timer = 0

    const updateClock = () => { clock.value = new Date().toLocaleTimeString('en-GB') }

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight
        scroll.value = Math.round((scrollY / (max || 1)) * 100)
    }

    const loop = (t: number) => {
        frames++
        if (t - last > 1000) {
            fps.value = frames
            frames = 0
            last = t
        }
        raf = requestAnimationFrame(loop)
    }

    onMounted(() => {
        updateClock()
        onScroll()
        addEventListener('scroll', onScroll, { passive: true })
        raf = requestAnimationFrame(loop)
        timer = window.setInterval(updateClock, 1000)
    })

    onBeforeUnmount(() => {
        removeEventListener('scroll', onScroll)
        cancelAnimationFrame(raf)
        clearInterval(timer)
    })

    return { scroll, fps, clock }
}