import { experience, projects } from "@/data/profile"

export const resume = {
  name: "I Ketut Kusumajaya",
  displayName: "Kusuma Jaya",
  role: "Full-stack Software Engineer",
  focus: "Web applications · AI & workflow integration",
  summary:
    "Full-stack software engineer with 5+ years of experience building and shipping web applications and business software. Work spans CRM, e-commerce, and ERP systems, including frontend interfaces, backend APIs, payments, cloud deployment, and practical workflow automation.",
  email: "kusuma.jaya1512@gmail.com",
  phone: "+62 87760474110",
  phoneLink: "tel:+6287760474110",
  location: "Bali, Indonesia",
  github: "https://github.com/bukitoka",
  linkedin: "https://linkedin.com/in/kusumajy",
  experience: experience.map((job) => ({
    ...job,
    date: job.date
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
      .replace(" — ", " – "),
  })),
  projects,
  skills: [
    { label: "Languages", value: "Python, TypeScript, Go, PHP" },
    {
      label: "Frontend",
      value:
        "React, Next.js, Tailwind CSS, TanStack Query, Vite with custom SSR",
    },
    { label: "Backend", value: "FastAPI, Django, Laravel, Express.js, Gin" },
    { label: "Data", value: "PostgreSQL, MySQL, MongoDB, Redis" },
    {
      label: "Cloud & delivery",
      value: "AWS, GCP, Docker, GitHub Actions, unit and end-to-end testing",
    },
    {
      label: "Integrations",
      value:
        "Stripe, Midtrans, Xendit, third-party APIs, AI APIs, n8n, webhooks",
    },
  ],
  education: {
    school: "ITB STIKOM Bali",
    degree: "Bachelor’s Degree, Information System",
    period: "2017 – 2021",
    result: "GPA 3.74",
  },
  certification:
    "EF SET English Certificate · C1 Advanced · 62/100 · March 2025",
  languages: "Indonesian (native) · English (C1 Advanced)",
}
