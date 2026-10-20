import type { Directive } from 'vue'

export const vTilt: Directive<HTMLElement, number | undefined> = {
    mounted(el, { value = 16 }) {
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

        el.addEventListener('pointermove', (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width
            const py = (e.clientY - r.top) / r.height
            if (!reduce) {
                el.style.transform = `perspective(800px) rotateY(${(px - 0.5) * value}deg) rotateX(${(0.5 - py) * value}deg) scale(1.02)`
            }
            el.style.setProperty('--mx', px * 100 + '%')
            el.style.setProperty('--my', py * 100 + '%')
        })

        el.addEventListener('pointerleave', () => {
            el.style.transform = ''
        })
    },
}