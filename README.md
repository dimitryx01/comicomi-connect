# Comicomi Connect — Food Social Network (Hobby Project)

**Comicomi Connect** is a comprehensive social ecosystem for food lovers, chefs, and restaurants. It is a high-performance platform that combines social networking features (feeds, messaging, follows) with a restaurant marketplace, recipe management, and a robust multi-role administration panel.

This project is currently **in active development** and is built as a **personal hobby project** during my free time to explore advanced full-stack patterns.

> 🚀 **Live Demo:** [comicomi-connect.lovable.app](https://comicomi-connect.lovable.app)  
> 🧪 **Test Credentials:** `derakad941@cristout.com` / `123456`  
> 🚧 **Status:** Work in Progress.

---

## 🌐 Repository Purpose (Portfolio / Review Only)

This repository is public **exclusively for portfolio and technical code review purposes** (recruitment processes). 
- **No permission** is granted to copy, modify, redistribute, or use this code for commercial or personal projects.
- Unauthorized use of the source code, assets, or design is strictly prohibited.

---

## ✨ Features

### 👤 User Experience
- **Personalized Feed:** Gastronomy-focused content with "Cheers" (likes), nested comments, and sharing.
- **Onboarding Wizard:** 4-step personalized setup (Welcome, Profile, Interests, Preferences).
- **Social Interaction:** Real-time notifications, private messaging (with blocking/preferences), and user follows.
- **Content Management:** Recipe publishing (ingredients/steps), image cropping, HEIC conversion, and intelligent compression.
- **Utility:** Shopping lists generated from recipe ingredients and "Saved Items" for posts, recipes, restaurants, and shared posts.
- **Discover Page:** Public access (no auth required) to explore community content.
- **User Profiles:** Detailed profiles with avatar upload, bio, location, and cooking level.

### 🍴 Restaurant Features
- **Detailed Profiles:** Address, cuisine types, contact info, website, and image galleries.
- **Advanced Reviews:** Multi-criteria ratings (Food Quality, Service, Cleanliness, Ambiance, Value).
- **Admin Requests:** Verification system for restaurant owners with document upload (DNI, Selfie, Ownership proof).
- **Management:** Per-establishment management and access action logs.

### 🛡️ Admin Panel (`/control-admin`)
- **Dashboard:** Key metrics and interactive charts (Recharts).
- **Role-Based Access:** Master Admin, Content Moderator, Establishment Manager, and Tech Support.
- **Moderation Suite:** Content report management (posts, recipes, comments, messages) and audit logs.
- **Business Tools:** Restaurant CRUD and access request reviews.
- **Independent Auth:** Custom system using `admin_users` table and dedicated Edge Functions.

---

## 🧱 Tech Stack

### Frontend
- **Core:** React 18.3 + TypeScript 5.5 + Vite 5.4 (SWC)
- **State & Data:** TanStack React Query 5.56 (Caching, Mutations & Optimistic Updates)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (Radix UI) + Framer Motion 12.23
- **Forms:** React Hook Form 7.53 + Zod 3.23 (Strict Validation)
- **UI Components:** Embla Carousel, Lucide React, Sonner (Toasts), Vaul (Drawers), CMDK, Date-fns.
- **Media Handling:** `react-easy-crop`, `browser-image-compression`, `heic2any`.

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL) with **77+ migrations** and **47 tables**.
- **Security:** Strict **Row Level Security (RLS)** on all tables and Supabase Auth.
- **Serverless:** 10 **Supabase Edge Functions** (Deno/TypeScript).
- **Storage:** Hybrid approach using Supabase Buckets + **Backblaze B2** (via Edge Functions).
- **Real-time:** Supabase Real-time subscriptions for notifications and messaging.

---

## 🛠️ Development Approach (AI-Assisted Workflow)

This project follows a modern development workflow where **AI was utilized exclusively for the initial UI design and layout scaffolding**. 

As the lead developer, I have personally engineered the full evolution of the platform:
- **Database Engineering:** Designed a complex schema with 47 tables, ENUMs, and RLS policies.
- **Custom Logic:** Developed **65+ custom hooks** to manage complex features like real-time messaging, pagination, and media handling.
- **Edge Computing:** Authored 10 Edge Functions to handle admin authentication, B2 storage signatures, and content moderation.
- **Architecture:** Implemented a feature-based component structure and centralized application configuration.
- **Refinement:** Manual refactoring, debugging, performance optimization, and responsive polishing.

---

## 🗂️ Project Structure

```text
src/
├── components/       # 18 feature directories (Admin, Auth, Feed, Messages, Onboarding, etc.)
│   ├── admin/        # Dashboard, moderation, and management components
│   ├── auth/         # Guards and authentication logic
│   ├── feed/         # Personalized and unified feeds
│   ├── messages/     # Chat window and conversation management
│   ├── notifications/# Real-time notification system
│   ├── post/         # Creation, editing, and interaction logic
│   ├── profile/      # User profile sections and dialogs
│   ├── recipe/       # Recipe management and filters
│   ├── restaurant/   # Profiles, reviews, and access requests
│   └── ui/           # 50+ shadcn/ui components + custom media utilities
├── contexts/         # Auth & AdminAuth contexts
├── hooks/            # 65+ custom hooks (usePostCreation, usePostsRealtime, etc.)
├── pages/            # 34+ pages (App, Legal, and Admin sections)
├── types/            # TypeScript definitions (post.ts, sharedPost.ts)
├── utils/            # 15 utilities (image compression, caching, B2 storage, performance)
├── config/           # Centralized app configuration (app.ts)
└── integrations/     # Supabase client and generated types
supabase/
├── functions/        # 10 Edge Functions (admin-auth, b2-upload, moderate-content, etc.)
└── migrations/       # 77+ SQL migration files
```

---

## 🗃️ Database Schema (47 Tables)

- **Core Social:** `users`, `posts`, `recipes`, `shared_posts`, `comments`, `recipe_comments`, `shared_post_comments`, `cheers`, `recipe_cheers`, `shared_post_cheers`, `comment_cheers`, `review_cheers`, `messages`, `notifications`, `user_interests`, `user_followers`, `user_follows`, `user_blocks`, `user_message_preferences`, `saved_posts`, `saved_recipes`, `saved_restaurants`, `saved_shared_posts`.
- **Restaurant & Admin:** `restaurants`, `restaurant_admins`, `restaurant_admin_requests`, `restaurant_access_actions`, `restaurant_reviews`, `restaurant_cuisines`, `reports`, `message_reports`, `moderation_actions`, `moderation_reasons`, `admin_users`, `admin_user_roles`, `admin_sessions`, `admin_audit_log`.
- **Catalog & Utility:** `locations`, `cities`, `postal_codes`, `cuisines`, `interests`, `interest_categories`, `measurement_units`, `address_term_mappings`, `shopping_lists`, `shopping_list_items`.

---

## ⚡ Edge Functions (10)

- `admin-auth`: Custom admin login validation against `admin_users`.
- `admin-create-restaurant`: Service role bypass for restaurant creation.
- `admin-delete-restaurant`: Secure establishment removal.
- `admin-get-post`: Detailed post analytics for admins.
- `admin-get-restaurant-requests`: Access request management.
- `b2-upload` / `b2-upload-public`: Media upload to Backblaze B2.
- `b2-signed-url`: Secure URL generation for private media.
- `b2-delete`: Media cleanup from B2.
- `moderate-content`: Automated and manual content moderation.

---

## 🧭 Main Routes

| Route | Auth Required | Description |
|---|---|---|
| `/` | No | Landing page |
| `/feed` | Yes | Main social feed |
| `/discover` | No | Public discovery page |
| `/recipes` | No | Recipe directory |
| `/restaurants` | No | Restaurant directory |
| `/profile` | Yes | User profile & settings |
| `/messages` | Yes | Private messaging system |
| `/onboarding` | Yes | Onboarding wizard |
| `/control-admin/*` | Admin | Full administration suite |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (LTS)
- npm or Bun

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file locally (do **not** commit it):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Scripts
- `npm run dev`: Start development server (port 8080).
- `npm run build`: Production build.
- `npm run lint`: ESLint check.
- `npm run preview`: Preview production build.

---

## 📄 License & Usage

**Copyright (c) 2024–2026 Jolman Gordillo. All Rights Reserved.**

This repository is public **exclusively for portfolio and technical code review purposes** (recruitment processes).
- **No permission** is granted to copy, modify, redistribute, or use this code for commercial or personal projects.
- Unauthorized use of the source code, assets, or design is strictly prohibited.

---
**Developed by Jolman Gordillo**  
[Website](https://jolmandeveloper.com) | [LinkedIn](https://www.linkedin.com/in/jolmang/)