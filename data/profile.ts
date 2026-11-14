export const projects = [
  {
    number: "01",
    name: "WineAdore",
    category: "E-COMMERCE / FRONTEND",
    description:
      "Buying a bottle was only part of it. Customers also needed a personal cellar, tasting events, and somewhere to find restaurants. I built those interfaces alongside the storefront and Stripe payments.",
    outcome: "Initial page loads reduced by approximately 30%.",
    stack: ["React 19", "TypeScript", "Custom SSR", "Stripe"],
    href: "https://wineadore.com",
    kind: "wine",
    year: "2025–2026",
    notes: [
      "Built customer accounts, the personal wine cellar, and Stripe checkout interfaces.",
      "Custom SSR, code splitting, and asset optimization cut initial page load by approximately 30%.",
    ],
  },
  {
    number: "02",
    name: "AutoCRM",
    category: "CRM / FULL STACK / AUTOMATION",
    description:
      "Sales teams needed to track leads without moving customer data between tools by hand. I connected the sales workspace, reporting, and permissions to automated follow-ups and status updates.",
    outcome: "Follow-ups and data updates handled by background workflows.",
    stack: ["FastAPI", "React", "PostgreSQL", "n8n"],
    href: "https://auto-crm-wheat.vercel.app/",
    kind: "crm",
    year: "2026",
    notes: [
      "Connected a React sales workspace to a FastAPI backend with role-based permissions.",
      "Integrated n8n and AI workflows for follow-ups, data synchronization, and sales status updates.",
    ],
  },
]
export const experience = [
  {
    company: "WineAdore",
    role: "Frontend Web Developer",
    date: "MAY 2025 — SEP 2026",
    description:
      "Built the storefront, personal wine cellar, Stripe wallet, and Maps integrations. Custom SSR and asset optimization cut initial load time by approximately 30%.",
    highlights: [
      "Delivered the storefront, personal wine cellar, Stripe wallet, and Google Maps features through implementation and production support.",
      "Improved load times and SEO with custom server-side rendering, code splitting, and asset optimization, reducing initial page load by approximately 30%.",
    ],
  },
  {
    company: "Jobseeker Company",
    role: "Full Stack Developer",
    date: "JUN 2024 — MAY 2025",
    description:
      "Modernized HR software, improved APIs, and automated releases with Docker and GitHub Actions, bringing deployment time from hours to minutes.",
    highlights: [
      "Modernized an existing HR platform, refactoring slow frontend and backend modules and adding automated tests.",
      "Automated releases with Docker and GitHub Actions, bringing deployment time from hours to minutes without deployment downtime.",
      "Built and maintained REST APIs and database queries, strengthened cloud security and monitoring, and worked with product and QA on reliable releases.",
    ],
  },
  {
    company: "Grune Technology",
    role: "Full Stack Developer",
    date: "JAN 2024 — MAY 2024",
    description:
      "Built a warehouse and inventory ERP for a Japanese liquor company, replacing spreadsheets with digital stock and delivery tracking.",
    highlights: [
      "Built a warehouse and inventory ERP for a Japanese liquor company, replacing spreadsheets with digital stock and delivery tracking.",
      "Designed database schemas and reporting queries for stock levels, incoming goods, and delivery schedules.",
      "Worked directly with warehouse staff to validate workflows, and added automated tests and documentation for daily operations.",
    ],
  },
  {
    company: "MKM Honda",
    role: "Full Stack Developer",
    date: "SEP 2021 — DEC 2023",
    description:
      "Delivered CRM systems for MKM Honda and BPR Kancana, connecting customer operations, loan workflows, and management reports.",
    highlights: [
      "Built CRM systems for MKM Honda and BPR Kancana, moving customer operations online and speeding up loan approvals.",
      "Connected third-party APIs and internal ERP services, and built reports for sales, customer activity, and loan progress.",
      "Trained staff and supported the systems after launch, resolving production issues and helping teams move away from paper processes.",
    ],
  },
]

export const skills = [
  {
    title: "What people use",
    items:
      "TypeScript · React · Next.js · TanStack Start · Tailwind CSS · TanStack Query · WordPress · Shopify · Motion · GSAP",
  },
  {
    title: "What keeps it running",
    items:
      "Python · Go · PHP · FastAPI · Django · Flask · Laravel · Gin · NestJS · Express.js · Fastify · Hono · Strapi · Payload CMS",
  },
  {
    title: "Where data lives",
    items: "PostgreSQL · MySQL · MongoDB · Redis · RabbitMQ · Meilisearch",
  },
  {
    title: "What joins it together",
    items:
      "Docker · AWS · GCP · Firebase · GitHub · GitLab · GitHub Actions · Sentry · Stripe · Midtrans · Xendit · Google Maps · Odoo · n8n · AI APIs",
  },
]
