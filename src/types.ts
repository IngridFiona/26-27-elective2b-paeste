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
    date?: string      // optional, e.g. 'May 28, 2026'
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

/* Used by ProjectCard.vue and ProjectsSection.vue */
export interface Project {
    title: string                              // project name
    schoolYear: string                         // e.g. '2024 – 2025'
    subject: string                            // course subject, e.g. 'Data Structures'
    semester?: string                          // optional, e.g. '1st Semester'
    status?: 'in-progress' | 'completed'       // optional badge on the card
    team?: string[]                            // optional teammates, e.g. ['Juan Dela Cruz', 'Maria Santos']
    art?: 'heatmap' | 'components' | 'code' | 'circuit' | 'chip' | 'sensor' | 'helmet' | 'house'   // decorative banner picture
}