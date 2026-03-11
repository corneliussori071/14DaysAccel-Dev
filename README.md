# 14DaysAccel Dev

A marketing and software consulting platform that demonstrates AI-accelerated software development. Users can explore project catalogues and generate software architecture plans tailored to their businesses.

---

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend     | Supabase (PostgreSQL, Auth, RLS)    |
| AI          | OpenAI API                          |
| Deployment  | Vercel                              |

## Development Philosophy

This project follows an **AI-accelerated development** methodology with **human engineering oversight**. AI tools are used to increase velocity, but every architectural decision, security boundary, and code merge is reviewed and validated by a human engineer.

Core principles:

- Speed with discipline: ship fast without cutting corners on quality.
- Security by default: secrets never touch version control.
- Professional standards: code is written as if every line will be reviewed by a client.
- Incremental progress: small commits, clear history, continuous improvement.

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Reusable React components
  lib/          # Shared utilities and helper functions
  services/     # API clients, Supabase queries, OpenAI integration
  types/        # TypeScript type definitions and interfaces
  config/       # Application configuration and constants
  styles/       # Global styles and Tailwind customizations
docs/           # Project documentation and engineering rules
public/         # Static assets
```

## Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)
- An OpenAI API key

## Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/14daysaccel-dev.git
   cd 14daysaccel-dev
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example file and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required variables (see `.env.example` for the full list):

   - `NEXT_PUBLIC_SUPABASE_URL` -- your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- your Supabase anonymous/public key
   - `OPENAI_API_KEY` -- your OpenAI API key

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [Development Rules](docs/development_rules.md) -- engineering standards enforced across the repository.

## License

MIT
