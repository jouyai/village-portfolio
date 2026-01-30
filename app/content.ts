// ============================================
// PORTFOLIO CONTENT - Edit this file to update your portfolio!
// ============================================

export const PORTFOLIO_CONTENT = {
    // ==========================================
    // ABOUT ME SECTION
    // ==========================================
    about: {
        name: "Nama Kamu",
        title: "Frontend Developer",
        avatar: "/assets/avatar.png", // Ganti dengan foto kamu
        bio: `Halo! Saya adalah seorang developer yang passionate dalam membuat 
    website dan aplikasi yang menarik. Saya suka belajar teknologi baru 
    dan selalu mencari cara untuk meningkatkan skill saya.`,

        skills: [
            "React / Next.js",
            "TypeScript",
            "Tailwind CSS",
            "Node.js",
            "Python",
            "Figma",
        ],

        education: [
            {
                school: "Universitas Contoh",
                degree: "S1 Teknik Informatika",
                year: "2020 - 2024",
            },
        ],
    },

    // ==========================================
    // MY PROJECTS SECTION
    // ==========================================
    projects: [
        {
            id: 1,
            title: "Project Pertama",
            description: "Deskripsi singkat tentang project ini. Teknologi apa yang digunakan dan apa fungsinya.",
            image: "/assets/projects/project1.png", // Screenshot project
            technologies: ["React", "Node.js", "MongoDB"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/username/project1",
        },
        {
            id: 2,
            title: "Project Kedua",
            description: "Deskripsi singkat tentang project kedua. Jelaskan fitur utamanya.",
            image: "/assets/projects/project2.png",
            technologies: ["Next.js", "TypeScript", "Tailwind"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/username/project2",
        },
        {
            id: 3,
            title: "Project Ketiga",
            description: "Deskripsi singkat tentang project ketiga.",
            image: "/assets/projects/project3.png",
            technologies: ["Python", "FastAPI", "PostgreSQL"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/username/project3",
        },
    ],

    // ==========================================
    // CONTACT SECTION
    // ==========================================
    contact: {
        email: "email@example.com",
        phone: "+62 812 3456 7890", // Opsional, hapus jika tidak mau tampil
        location: "Jakarta, Indonesia",

        socialLinks: [
            {
                platform: "GitHub",
                url: "https://github.com/username",
                icon: "🐙",
            },
            {
                platform: "LinkedIn",
                url: "https://linkedin.com/in/username",
                icon: "💼",
            },
            {
                platform: "Twitter",
                url: "https://twitter.com/username",
                icon: "🐦",
            },
            {
                platform: "Instagram",
                url: "https://instagram.com/username",
                icon: "📷",
            },
        ],

        message: "Mau ngobrol atau kerjasama? Jangan ragu untuk menghubungi saya!",
    },
};

export type PortfolioContent = typeof PORTFOLIO_CONTENT;
export type Project = typeof PORTFOLIO_CONTENT.projects[0];
export type SocialLink = typeof PORTFOLIO_CONTENT.contact.socialLinks[0];
