import { computed, ref } from 'vue'

export type Theme = 'dark' | 'light'

const KEY = 'portfolio-theme'

// shared by every component that calls useTheme()
const theme = ref<Theme>('dark')

function apply(t: Theme) {
    theme.value = t
    document.documentElement.dataset.theme = t
}

/* Call once in main.ts, before the app mounts.
   Uses the saved choice; otherwise starts in dark mode. */
export function initTheme() {
    let saved: string | null = null
    try {
        saved = localStorage.getItem(KEY)
    } catch {
        /* storage blocked: ignore */
    }
    apply(saved === 'light' ? 'light' : 'dark')
}

export function useTheme() {
    const isLight = computed(() => theme.value === 'light')

    function toggle() {
        const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
        apply(next)
        try {
            localStorage.setItem(KEY, next)
        } catch {
            /* storage blocked: ignore */
        }
    }

    return { theme, isLight, toggle }
}