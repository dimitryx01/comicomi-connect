# Comicomi Connect — Food Social Network (Hobby Project)

**Comicomi Connect** is a mini social network for food lovers: a place to share culinary posts, discover restaurants, publish recipes, and interact through follows, likes (“Cheers”), comments, saves, messaging, and notifications.

This project is currently **in active development** and I build it as a **personal hobby project** during my free time.

## Live Demo
- https://comicomi-connect.lovable.app

## Repository Purpose (Portfolio / Review Only)

This repository is public **only so recruiters can review the code** and evaluate my engineering work.  
It is **not** intended to be used, copied, or redistributed.

## ✨ Core Features

### For Users
- Personalized **Feed** with gastronomy posts
- **Cheers** (likes) for posts and recipes
- Share posts and recipes
- Comments on publications
- Follow / unfollow users
- Private messaging between users
- Save posts, recipes, and restaurants
- Onboarding flow based on culinary preferences

### For Restaurants
- Verified restaurant profiles
- Restaurant/venue management
- Requests to become an admin of a restaurant
- Publishing content linked to restaurants

### Admin Panel
- Admin dashboard with key metrics
- Admin user management
- Reports moderation
- Establishments management
- Audit logs
- Support / tickets

## 🧱 Tech Stack

### Frontend
- React 18.3 + TypeScript 5.5
- Vite 5.4
- Tailwind CSS 3.4 + shadcn/ui
- Radix UI (accessible primitives)
- React Router 6.26
- TanStack Query 5.56
- Framer Motion

### Backend / Data
- Supabase (PostgreSQL)
- Supabase Auth + Roles (user / moderator / admin)
- Row Level Security (RLS) across tables
- Supabase Functions / Edge Functions
- Real-time subscriptions
- Storage buckets (media)
- Database migrations (77+)

## 🧠 Development Approach (AI-Assisted, Developer-Owned)

This project started with an **AI-assisted workflow** to accelerate early UI scaffolding and layout experimentation.

After the initial template, I have been responsible for the **full development and evolution** of the application, including:
- Data modeling and Supabase integration
- RLS policies and security decisions
- Feature implementation (feed, messaging, saves, notifications, admin panel, etc.)
- Refactoring, debugging, performance improvements
- UX and responsive behavior polishing
- Code organization (feature-based components + custom hooks)

## 🗂️ Project Structure (High Level)

```text
src/
├── components/        # React components organized by feature
│   ├── admin/         # Admin panel components
│   ├── auth/          # Authentication
│   ├── feed/          # Feed & posts
│   ├── layout/        # Main layouts
│   ├── messages/      # Messaging system
│   ├── notifications/ # Notifications
│   ├── post/          # Post create/edit
│   ├── profile/       # User profiles
│   ├── recipe/        # Recipes
│   ├── restaurant/    # Restaurants directory & profiles
│   ├── sidebar/       # Navigation sidebar
│   └── ui/            # shadcn/ui components
├── contexts/          # React contexts (Auth, etc.)
├── hooks/             # 63+ custom hooks
├── pages/             # App pages (including /admin and /legal)
├── types/             # TypeScript types
├── utils/             # Shared utilities
└── config/            # App config
supabase/              # Supabase config, migrations, functions
```

## 🗃️ Database (Supabase) — Main Tables

- `users` — user profiles
- `restaurants` — venues
- `restaurant_admins` — restaurant admin mapping
- `recipes` — recipes (ingredients/steps with JSONB)
- `posts` — social publications
- `cheers` — likes (posts/recipes)
- `comments` — comments
- `follows` — follow system
- `messages` — private messages
- `notifications` — notifications system
- `saved_items` — saved content
- `reports` — moderation reports
- `audit_logs` — audit trail

## 🧭 Main Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/feed` | Main feed |
| `/discover` | Discover |
| `/recipes` | Recipes |
| `/restaurants` | Restaurants directory |
| `/profile` | User profile |
| `/messages` | Messaging |
| `/notifications` | Notifications |
| `/saved` | Saved items |
| `/settings` | Settings |
| `/control-admin/*` | Admin panel |

## ⚙️ Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run build:dev    # Development-mode build
npm run lint         # ESLint
npm run preview      # Preview production build
```

## 🔐 Environment Variables

Create a `.env` file locally (do **not** commit it). Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Production secrets must be managed through the hosting provider environment settings.

## 🧪 Demo / Test Access

A demo account can be provided to reviewers upon request.  
(For security and data integrity reasons, public credentials are not included in this README.)

## 🚧 Status

This project is a **work in progress**. Features, UI, database schema, and policies may change frequently as the platform evolves.

## 📄 License & Usage

**Copyright (c) 2024–2026 Jolman Gordillo. All Rights Reserved.**

This repository is public **exclusively for portfolio and technical code review purposes** (recruitment processes).
- **No permission** is granted to copy, modify, redistribute, or use this code for commercial or personal projects.
- Unauthorized use of the source code, assets, or design is strictly prohibited.

---
Developed by **Jolman Gordillo**  
Website: https://jolmandeveloper.com  
LinkedIn: https://www.linkedin.com/in/jolmang/