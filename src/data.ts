import type { Certificate, Education, Fact, Skill } from './types'

export const profile = {
    name: 'Ingrid Fiona Paeste',
    logo: 'INGRID FIONA//PAESTE',
}

export const phrases: string[] = [
    'Computer Engineering Student',
    'Always learning, always building',
    'Still figuring out why my code works',
    'Pindot dito, code doon',
    'Sana hindi mag-error',
]

export const techPills: string[] = [
    'C++', 'C', 'Django', 'Java', 'Phyton',
    'HTML', 'CSS', 'nodejs', 'PostgreSQL', 'JavaScript', 'Arduino'
]

export const socials = [
    {
        name: 'GitHub',
        href: 'https://github.com/IngridFiona',
        path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/ingridfiona.paeste',
        path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/laii_jie/?hl=en',
        path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    },
    {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@neer_ingrid?is_from_webapp=1&sender_device=pc',
        path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    },
]

export const about = {
    paragraphs: [
        'I’m Ingrid Fiona Paeste, an computer engineering student at Cagayan State University who is endlessly curious and always building.\n' +
        '\n' +
        'I love the process of figuring things out from scratch.'+
        '\n' +
        'To me, being a student isn\'t about knowing everything yet; it\'s about having the passion to learn, experiment, and turn code and circuits into working reality. I\'m always eager to tackle new challenges, build cool tech, and grow a little bit more every single day.',
    ],
    facts: [
        { label: 'Location', value: 'Sta. Maria, Gattaran, Cagayan 3508' },
        { label: 'Focus', value: 'Front-end & UI/UX' },
        { label: 'Status', value: 'CpE Student @ CSU' },
    ] as Fact[],
}

export const education: Education[] = [
    {
        school: 'Cagayan State University-Carig Campus',
        degree: 'BS in Computer Engineering',
        period: '2023 – Present',
        details: 'Pursuing a Bachelor of Science in Computer Engineering with an emphasis on embedded systems, IoT development, and software engineering.',
    },
    {
        school: 'Don Mariano Marcos National High School',
        degree: 'STEM Strand',
        period: '2021 – 2023',
        details: 'Graduated with honors. Eager to pursue an Engineering Course.',
    },
    {
        school: 'Don Mariano Marcos National High School',
        degree: 'Junior High School',
        period: '2017 – 2021',
        details: 'Completed foundational secondary education, discovering a growing interest in problem-solving and technology.',
    },
]

export const skillGroups = [
    {
        title: 'Technical Skills',
        items: [
            'Programming Languages: C, C++, Java, and Python',
            'Knowledge of Microprocessors and Embedded Systems',
            'Basic Digital Logic Circuits and Electronics',

],
    },
    {
        title: 'Soft Skills',
        items: [
            'Fast Learner', 'Teamwork and Collaboration', 'Problem Solving',
            'Time Management', 'Adaptability', 'Critical Thinking',
        ],
    },
]

/* Photos live in public/certs/ — the image path starts with /certs/ */
export const certificates: Certificate[] = [
    {
        id: 1,
        title: 'Frontiers of Computer Engineering: 2025 International Conference on New and Emerging Tools',     // change to the real title
        issuer: 'Collaborative Innovation: Shaping the Future of Technology through Academic-Industry Partnership, Day 01',          // change to who gave it
        category: 'Training',
        year: 'December 12, 2025',
        c1: '#00f5d4',
        c2: '#0a4f6e',
        image: 'certday1.jpeg',  // ← your photo 1
    },
    {
        id: 2,
        title: 'Frontiers of Computer Engineering: 2025 International Conference on New and Emerging Tools',
        issuer: 'Collaborative Innovation: Shaping the Future of Technology through Academic-Industry Partnership, Day 02',
        category: 'Training',
        year: 'December 13, 2025',
        c1: '#ff2e97',
        c2: '#4a0f5c',
        image: 'certday2.jpeg',  // ← your photo 2
    },
    {                                     // ← new block
        id: 3,                            // next number, must be unique
        title: 'Regional ITE Summit 2026',       // title shown on the card
        issuer: 'Building Smarter Futures through Technology and Engineering', // who gave it
        category: 'Training',             // filter button name
        year: 'July 22, 2026',
        c1: '#3a86ff',                    // c1 and c2 only matter if there is no photo
        c2: '#0a2a6e',
        image: 'itesummit.jpeg',    // must match the file name exactly
    },
    {                                          // ← NEW: OJT
        id: 4,
        title: 'On-the-Job Training (OJT)',    // change to the exact title
        issuer: 'Magellan Solutions',                // the company where you did your OJT
        category: 'OJT',                       // creates a new "OJT" filter button
        year: 'June 04,2026',
        c1: '#ff9f1c',
        c2: '#5a2a0a',
        image: 'ojt.jpeg',                     // ← your OJT file name
    },
    {                                          // ← NEW: BOSH SO1
        id: 5,
        title: 'Basic Occupational Safety and Health Training\n',                     // or the full name of the training
        issuer: 'Department of Labor and Employment, Occupational Safety and Health Center',                 // the training provider
        category: 'Safety',                    // creates a new "Safety" filter button
        year: 'May 28, 2026',
        c1: '#4cc9f0',
        c2: '#0f3460',
        image: 'boshso1.jpeg',                 // ← your BOSH SO1 file name
    },
    {                                          // ← NEW: BOSH SO1
        id: 6,
        title: 'Best Practices for Personal Data Protection:Safeguarding Your Digital Life\n',                     // or the full name of the training
        issuer: 'Department of Science and Technology-Science Education Institute-Region 2',                 // the training provider
        category: 'Seminar',                    // creates a new "Safety" filter button
        year: 'April 04, 2025',
        c1: '#4cc9f0',
        c2: '#0f3460',
        image: 'dost.jpeg',                 // ← your BOSH SO1 file name
    },

]