export interface Skill {
    name: string
    level: number
}

export interface Certificate {
    id: number
    title: string
    issuer: string
    category: string
    year: string
    date?: string      // ← new, optional, e.g. 'May 28, 2026'
    c1: string
    c2: string
    image?: string
}

export interface Fact {
    label: string
    value: string
}

export interface Education {
    school: string
    degree: string
    period: string
    details: string
}