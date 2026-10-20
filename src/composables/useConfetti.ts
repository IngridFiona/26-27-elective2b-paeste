interface Piece {
    x: number; y: number; vx: number; vy: number
    w: number; h: number; r: number; vr: number
    c: string; life: number
}

export function useConfetti() {
    function burst(x: number, y: number) {
        const cv = document.createElement('canvas')
        Object.assign(cv.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '60' })
        cv.width = innerWidth
        cv.height = innerHeight
        document.body.appendChild(cv)

        const ctx = cv.getContext('2d')!
        const colors = ['#00f5d4', '#ff2e97', '#ffffff', '#3a86ff', '#ffd60a']

        const pieces: Piece[] = Array.from({ length: 160 }, (_, i) => {
            const a = Math.random() * Math.PI * 2
            const s = Math.random() * 11 + 4
            return {
                x, y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s - 6,
                w: Math.random() * 8 + 4,
                h: Math.random() * 5 + 3,
                r: 0,
                vr: Math.random() * 0.4 - 0.2,
                c: colors[i % colors.length] ?? '#00f5d4',
                life: 1,
            }
        })

        const tick = () => {
            ctx.clearRect(0, 0, cv.width, cv.height)
            let alive = false
            for (const p of pieces) {
                if (p.life <= 0) continue
                alive = true
                p.vy += 0.28
                p.vx *= 0.99
                p.x += p.vx
                p.y += p.vy
                p.r += p.vr
                p.life -= 0.008
                ctx.save()
                ctx.globalAlpha = Math.max(p.life, 0)
                ctx.translate(p.x, p.y)
                ctx.rotate(p.r)
                ctx.fillStyle = p.c
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
                ctx.restore()
            }
            if (alive) requestAnimationFrame(tick)
            else cv.remove()
        }
        tick()
    }

    return { burst }
}