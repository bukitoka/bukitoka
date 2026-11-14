import { Workflow } from "lucide-react"

const logos: Record<string, string> = {
  TypeScript: "typescript",
  React: "react",
  "Next.js": "nextdotjs",
  "Tailwind CSS": "tailwindcss",
  "TanStack Query": "reactquery",
  "TanStack Start": "tanstack",
  WordPress: "wordpress",
  Shopify: "shopify",
  Motion: "motion",
  GSAP: "gsap",
  Python: "python",
  Go: "go",
  PHP: "php",
  FastAPI: "fastapi",
  Django: "django",
  Flask: "flask",
  Laravel: "laravel",
  Gin: "gin",
  NestJS: "nestjs",
  "Express.js": "express",
  Fastify: "fastify",
  Hono: "hono",
  Strapi: "strapi",
  "Payload CMS": "payloadcms",
  Odoo: "odoo",
  PostgreSQL: "postgresql",
  MySQL: "mysql",
  MongoDB: "mongodb",
  Redis: "redis",
  RabbitMQ: "rabbitmq",
  Meilisearch: "meilisearch",
  Docker: "docker",
  AWS: "amazonwebservices",
  GCP: "googlecloud",
  Firebase: "firebase",
  GitHub: "github",
  GitLab: "gitlab",
  "GitHub Actions": "githubactions",
  Sentry: "sentry",
  Stripe: "stripe",
  Midtrans: "midtrans",
  Xendit: "xendit",
  "Google Maps": "googlemaps",
  n8n: "n8n",
}

export function TechLogo({ name }: { name: string }) {
  const logo = logos[name]

  if (!logo) {
    return (
      <Workflow
        aria-hidden="true"
        className="size-5 shrink-0 text-brand-600 dark:text-brand-300"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      data-tech-logo={name}
      className="block size-5 shrink-0 bg-brand-600 dark:bg-brand-300"
      style={{ mask: `url(/tech/${logo}.svg) center / contain no-repeat` }}
    />
  )
}
