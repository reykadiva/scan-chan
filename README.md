# Scan-Chan

> A retro arcade barcode-hunting game and virtual companion pet simulation built with Next.js, React 19, Supabase, and Prisma. Scan physical product barcodes in the real world to feed, raise, and evolve your pixel cat companion while building daily streaks.

[![Live Demo](https://img.shields.io/badge/Demo-scanchan.vercel.app-d65a7a?style=flat-square)](https://scanchan.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-reykadiva%2Fscan--chan-1f3f5c?style=flat-square)](https://github.com/reykadiva/scan-chan)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-22d3ee?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Game Concept & Lore](#game-concept--lore)
- [Core Gameplay Mechanics](#core-gameplay-mechanics)
  - [1. Real-World Optical Barcode Scanner](#1-real-world-optical-barcode-scanner)
  - [2. Procedural Pixel Companion Engine](#2-procedural-pixel-companion-engine)
  - [3. Evolution & Progression Curve](#3-evolution--progression-curve)
  - [4. TikTok-Style Daily Streak System](#4-tiktok-style-daily-streak-system)
  - [5. Food Inventory & Revival Mechanics](#5-food-inventory--revival-mechanics)
  - [6. Six-Theme Arcade Styling Engine](#6-six-theme-arcade-styling-engine)
  - [7. Procedural Web Audio & Lo-Fi Jukebox](#7-procedural-web-audio--lo-fi-jukebox)
- [System Architecture](#system-architecture)
  - [High-Level Data Flow](#high-level-data-flow)
  - [Dual-Path Data Resilience](#dual-path-data-resilience)
  - [Row Level Security & Database Schema](#row-level-security--database-schema)
- [Repository Structure](#repository-structure)
- [Tech Stack Details](#tech-stack-details)
- [Quality Assurance & Verification](#quality-assurance--verification)
  - [Unit & Integration Test Suite](#unit--integration-test-suite)
  - [End-to-End Automation](#end-to-end-automation)
  - [Static Analysis](#static-analysis)
- [Soundtrack Attribution](#soundtrack-attribution)
- [Local Development Setup](#local-development-setup)
- [Deployment on Vercel](#deployment-on-vercel)
- [Authors & Acknowledgments](#authors--acknowledgments)
- [License](#license)

---

## Overview

Scan-Chan transforms routine trips to grocery shelves, pantry cabinets, and retail stores into an 8-bit Tamagotchi-inspired expedition. By scanning physical barcodes (UPC-A, EAN-13, EAN-8, Code-128) using your device camera, you discover item nutritional data, convert everyday consumables into in-game cat treats, and earn experience points to evolve your pet from a tiny kitten to a legendary feline guardian.

The application operates as a modern progressive web application designed mobile-first for smartphones and tablets, while scaling gracefully to desktop displays. It implements dual storage modes: an instant **Guest Mode** powered by browser persistence for immediate friction-free play, and an authenticated **Arashu Hunter Mode** using Google OAuth single sign-on backed by Supabase Auth and PostgreSQL cloud database synchronization.

- **Live Application:** [https://scanchan.vercel.app](https://scanchan.vercel.app)
- **Source Code:** [https://github.com/reykadiva/scan-chan](https://github.com/reykadiva/scan-chan)

---

## Game Concept & Lore

In the quiet universe of Scan-Chan, consumer barcodes are not merely stock-keeping identifiers; they are encoded cosmic frequencies containing nutritional lifeforce. 

Players assume the role of an **Item Hunter**. Upon arrival in the Secret Garden, you adopt a companion cat. Your pet requires sustenance to thrive. When neglected, your cat weakens, enters starvation, and eventually faints into a spectral spirit state (`hunger = 0`). Only by scanning real-world physical items—converting instant noodles, teas, biscuits, and fruits into digestible digital inventory—can you revive your pet, deepen affection, and unlock higher evolution forms.

---

## Core Gameplay Mechanics

```
 [Physical Barcode] ──> [Optical ZXing Engine] ──> [Open Food Facts API]
                                                           │
                                                           ▼
 [XP & Level Progression] <── [Inventory & Feeding] <── [Product Catalog]
            │                          │
            ▼                          ▼
 [Pet Evolution & Moods]     [TikTok Streak Multiplier]
```

### 1. Real-World Optical Barcode Scanner

- **Camera Integration:** Built using `@zxing/library` with automatic continuous video stream decoding.
- **Supported Formats:** EAN-13, EAN-8, UPC-A, UPC-E, Code-128, and Code-39.
- **Enrichment Pipeline:** Queries Open Food Facts API asynchronously to extract verified product titles, brand names, product imagery, and nutritional classifications.
- **Manual Contributor Fallback:** Unknown barcodes trigger a streamlined modal allowing players to register item names, brands, categories, and food values directly into the global catalog.
- **Anti-Spam Cooldown:** Enforces a 15-second scanning debounce per barcode and a 2-second global camera shutter cooldown to prevent artificial XP inflation.

### 2. Procedural Pixel Companion Engine

The pet companion is rendered via a custom 24x24 coordinate-based procedural canvas (`pixel-cat.tsx`), avoiding blurry static raster files:

- **Eight Cat Variants:**
  - `calico`: Classic tri-color tortoiseshell (Scan-chan Jr.)
  - `gray`: Urban smoke shorthair
  - `cyan`: Electric cyber feline
  - `pink`: Bubblegum cherry blossom
  - `black`: Midnight shadow stealth cat
  - `tabby`: Sunburst ginger striped
  - `guest-smiling`: Neutral companion for guest travelers
  - `arashu-smiling`: Royal companion for registered hunters
- **Accessories:** Dynamic pixel overlays for cowboy hats, wizard caps, sunglasses, and custom aura borders.
- **Dynamic Emotional States:**
  - `Dead / Fainted (0% Hunger)`: Rotated 90-degrees horizontal resting pose, cross-eyes (`X X`), desaturated palette, and a floating pixel ghost spirit overhead. Prompts the player to `[Feed to Revive! 🍖]`.
  - `Starving (1-25% Hunger)`: Trembling animations, downcast watery eyes, tear drops, and distressed meow bubbles.
  - `Normal (26-70% Hunger)`: Steady tail wagging, calm breathing cycle.
  - `Happy (71-100% Hunger)`: Bright eyes, blushing cheeks, energetic bounce animation.

### 3. Evolution & Progression Curve

The leveling curve is calibrated mathematically to support a 60-day natural campaign to the level cap (Level 50):

$$\text{Required XP}(L) = \lfloor 100 + 3 \cdot L^{1.6} \rfloor$$

| Stage Tier | Level Range | Companion Avatar & Visual Form | Unique Visual Features & Accessories |
|:---|:---:|:---|:---|
| **Kitten** | 1 – 9 | **Calico** (Tri-color Tortoiseshell) | Compact base kitten sprite, default meow dialogues |
| **Young Cat** | 10 – 19 | **Ginger Tabby** (Sunburst Striped) | High-contrast orange fur, cowboy hat accessory unlock |
| **Adult Cat** | 20 – 34 | **Midnight Shadow** (Deep Charcoal) | Stealth sleek silhouette, wizard hat accessory unlock |
| **Wise Cat** | 35 – 49 | **Cyber Teal** (Electric Cyan) | Vibrant cyber glow palette, pixel shades sunglasses unlock |
| **Legendary Cat** | 50 (MAX) | **Royal Celestial** (Arashu Princess Pink) | **Gold Royal Crown with Cyan Diamond Gems**, **Animated Wagging Tail**, peak affection dialogues |

### 4. TikTok-Style Daily Streak System

- **Calendar Day Verification:** Strict date boundary calculations prevent time-zone manipulation. A streak increments exactly once per calendar day upon your first valid scan.
- **Active Multiplier:** Consecutive daily activity stacks a tiered XP multiplier applied to all scan rewards:
  - 1 – 2 Days: `1.0x` Multiplier
  - 3 – 6 Days: `1.2x` Multiplier
  - 7 – 13 Days: `1.4x` Multiplier
  - 14 – 29 Days: `1.7x` Multiplier
  - 30+ Days: `2.0x` Maximum Multiplier
- **Missed Day Decay:** Missing a full calendar day resets the counter to 0, encouraging daily habit loops.

### 5. Food Inventory & Revival Mechanics

- Scanned grocery and food items are placed into the player's persistent `Food Bag`.
- Each feeding action restores hunger by +25 points and awards companion affection.
- When your companion drops to 0% hunger, pet interaction dialogs lock into urgent emergency mode until revived with an edible inventory treat.

### 6. Six-Theme Arcade Styling Engine

Players can toggle between six high-contrast arcade color themes, instantly updating CSS custom properties without page refreshes:

- **Retro Pink & White:** Classic bubblegum arcade aesthetic (`#d65a7a`).
- **Sage Green & Cream:** Peaceful forest meadow palette (`#7a9a78`).
- **Butter Yellow & Vanilla:** Warm bakery pastry tone (`#e6c86e`).
- **Powder Blue & Cloud:** Breezy sky island atmosphere (`#7ba7cc`).
- **Lavender & Lilac:** Dreamy twilight castle mood (`#9d8ec7`).
- **Terracotta & Beige:** Warm rustic clay palette (`#c48463`).

All themes strictly adhere to tactile pixel styling: solid borders (`2px solid var(--theme-dark)`), zero blur hard drop-shadows (`4px 4px 0px var(--theme-dark)`), and WCAG AAA compliance.

### 7. Procedural Web Audio & Lo-Fi Jukebox

- **Synthesizer SFX:** Pure procedural Web Audio API oscillator beeps for button taps, scan confirmations, errors, and level-ups. Zero audio asset download overhead for sound effects.
- **Background Music Engine:** Integrated HTML5 audio player supporting 5 distinct playback modes:
  - Mode 0: Sequential Continuous Playlist (BGM 1 → 2 → 3 → 4 loop)
  - Mode 1: Pufino - Soaked Continuous Single Loop
  - Mode 2: Nebulite - Kyoto Continuous Single Loop
  - Mode 3: Lukrembo - Bread Continuous Single Loop
  - Mode 4: Massobeats - Honey Jam Continuous Single Loop

---

## System Architecture

### High-Level Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser                       │
│  Next.js 16 App Router (React 19 Server/Client Comps)   │
│  Zustand Player Store (`scan-chan-player-state`)       │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [Guest Mode Path]          [Arashu Hunter Path]
     LocalStorage               Next.js API Route Handlers
     Instant Offline             - /api/auth/*
     Single-device               - /api/profile
                                 - /api/scan
                                 - /api/products
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                 Supabase Auth SSR               Prisma ORM (v7)
                 (HTTP-only Cookies)             (Direct PostgreSQL Pool)
                                                         │
                                                         ▼
                                                Supabase Cloud DB
                                                (12 Relational Tables)
```

### Dual-Path Data Resilience

The backend architecture employs a dual-path design:
1. **Cloud PostgreSQL Primary:** Authenticated hunters synchronize state to Supabase PostgreSQL using Prisma client connection pooling (`aws-1-ap-southeast-2.pooler.supabase.com:5432`).
2. **Local Fallback Store:** When operating in offline environments, test execution contexts, or during network disruptions, `src/lib/database/local-db.ts` acts as an automated fallback, ensuring game loops never throw unhandled exceptions.

### Row Level Security & Database Schema

All 12 tables in the production Supabase database have **Row Level Security (RLS)** strictly enabled:

```sql
-- Security verification status
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;
```

---

## Repository Structure

```text
scan-chan/
├── prisma/
│   ├── full-supabase-migration.sql # 12-table idempotent migration & RLS definitions
│   ├── migrations.sql              # Incremental migration history
│   ├── schema.prisma               # Prisma data models & relations
│   ├── seed.ts                     # Initial database seeding script
│   └── cleanup.ts                  # Database purge & reset utility
├── public/
│   ├── audio/                      # Audio soundtrack files
│   │   ├── bgm-1.mp3               # Pufino - Soaked
│   │   ├── bgm-2.mp3               # Nebulite - Kyoto
│   │   ├── bgm-3.mp3               # Lukrembo - Bread
│   │   └── bgm-4.mp3               # Massobeats - Honey Jam
│   └── images/
│       └── garden-bg.jpg           # Ambient background illustration
├── scripts/
│   ├── migrate-supabase.ts         # Direct cloud DDL execution script
│   └── verify-and-clean-cloud.ts   # Smoke testing & cloud cleanup auditor
├── src/
│   ├── app/
│   │   ├── api/                    # Serverless Next.js API Routes
│   │   │   ├── auth/               # OAuth session, guest mode, logout
│   │   │   ├── products/           # Catalog retrieval & product creation
│   │   │   ├── profile/            # Hunter profile & settings mutations
│   │   │   └── scan/               # Barcode processing & XP reward pipeline
│   │   ├── play/
│   │   │   ├── mode/               # Mode switch portal
│   │   │   └── page.tsx            # Main Game Dashboard (Bento Hub & Pet Card)
│   │   ├── product/[barcode]/      # Dynamic product dossier view
│   │   ├── scan/                   # Fullscreen optical scanner page
│   │   ├── globals.css             # Tailwind v4 setup & theme variables
│   │   ├── layout.tsx              # Root HTML wrapper, font definitions, Toaster
│   │   └── page.tsx                # Title screen & interactive cat playground
│   ├── components/
│   │   ├── game/                   # Core game UI components
│   │   │   ├── nickname-setup.tsx  # Initial profile onboarding dialog
│   │   │   ├── pet-panel.tsx       # Companion stats, feeding & speech bubbles
│   │   │   ├── pixel-cat.tsx       # 24x24 procedural pixel cat engine
│   │   │   ├── product-form.tsx    # Manual barcode submission form
│   │   │   ├── product-list.tsx    # Registered items inventory browser
│   │   │   ├── register-product-modal.tsx # Contributor catalog modal
│   │   │   ├── room-selector.tsx   # Environment background switcher
│   │   │   ├── scan-history.tsx    # Scanned items ledger
│   │   │   ├── settings-modal.tsx  # Theme, BGM, and cosmetic settings
│   │   │   ├── streak-display.tsx  # TikTok streak counter & flame badges
│   │   │   ├── webcam-capture.tsx  # ZXing camera viewfinder
│   │   │   └── xp-popup.tsx        # Floating XP reward banner
│   │   ├── layout/                 # AppHeader, BottomNav, containers
│   │   ├── providers/              # AudioProvider, ThemeProvider
│   │   └── ui/                     # Tactile retro buttons, badges, modals
│   ├── lib/
│   │   ├── database/               # Prisma client & local fallback engine
│   │   ├── supabase/               # SSR server client, client helper, middleware
│   │   ├── game-config.ts          # Cooldowns, multipliers, level formula
│   │   ├── haptics.ts              # Browser vibration API wrapper
│   │   ├── streak-helpers.ts       # Calendar day validation algorithms
│   │   ├── streak-multiplier.ts    # Consecutive day math multiplier
│   │   └── theme-config.ts         # Six arcade theme definitions
│   ├── services/                   # Business logic layer
│   │   ├── auth-service.ts         # Google OAuth sync & session management
│   │   ├── player-service.ts       # Profile, stats, inventory, and feeding logic
│   │   ├── product-service.ts      # Barcode lookup & catalog CRUD
│   │   └── scanner-service.ts      # Scan processing pipeline
│   ├── stores/
│   │   └── player-store.ts         # Unified Zustand state management
│   └── middleware.ts               # Edge session validation & route guards
└── tests/
    ├── full-e2e-overhaul.spec.ts   # Playwright end-to-end multi-viewport suite
    ├── integration/
    │   └── supabase-integration.test.ts # Live cloud database integration tests
    └── unit/
        ├── player-store.test.ts    # Store state mutation tests
        ├── streak-helpers.test.ts  # Calendar date math unit tests
        └── streak-multiplier.test.ts # Multiplier formula verification
```

---

## Tech Stack Details

| Domain | Technology | Version | Purpose |
|:---|:---|:---:|:---|
| **Core Framework** | Next.js | `16.2.9` | React server components, App Router, API routes |
| **UI Library** | React | `19.2.4` | Modern component rendering engine |
| **Language** | TypeScript | `5.x` | Strict end-to-end type safety |
| **Styling** | Tailwind CSS | `v4` | Design system with zero runtime CSS-in-JS |
| **Animation** | Motion / GSAP | `12.x / 3.x` | Tactile spring transitions and popup banners |
| **Barcode Detection** | `@zxing/library` | `^3.0.0` | Real-time browser-based optical barcode decoding |
| **Database ORM** | Prisma Client & CLI | `7.8.0` | Type-safe PostgreSQL client with connection pooler |
| **Cloud Database** | Supabase | PostgreSQL 15 | Relational cloud database hosting 12 tables |
| **Authentication** | `@supabase/ssr` | `^0.12.0` | Google OAuth SSO with cookie-based session storage |
| **State Management** | Zustand | `5.0.14` | Lightweight isolated client state container |
| **Testing Engine** | Vitest & Playwright | `4.1 / 1.61` | Fast unit, integration, and cross-browser testing |

---

## Quality Assurance & Verification

The project enforces strict software engineering standards, validated across static, unit, integration, and multi-viewport end-to-end environments:

### Unit & Integration Test Suite

The test suite runs using Vitest with 100% pass rates across 58 test cases:

```bash
npm run test
```

- **`tests/unit/streak-multiplier.test.ts` (22 tests):** Validates tiered multipliers from 0-day initialization up to 100+ day consecutive streaks.
- **`tests/unit/streak-helpers.test.ts` (24 tests):** Validates date boundary calculations, leap years, timezone rollovers, and missed-day streak resets.
- **`tests/unit/player-store.test.ts` (8 tests):** Validates pet evolution triggers, hunger decay, title changes, and inventory consumption.
- **`tests/integration/supabase-integration.test.ts` (4 tests):** Executes directly against active Supabase Cloud PostgreSQL, verifying:
  1. Environment configuration and connectivity
  2. User registration and profile synchronization with cat avatar
  3. Product catalog registration, scan logging, and streak persistence
  4. Feeding, XP progression, level increments, and inventory sync

### End-to-End Automation

Playwright automates end-to-end test scenarios across multiple form factors:
- **Mobile Viewport:** `375 x 812` (iPhone X / Modern Android)
- **Tablet Viewport:** `768 x 1024` (iPad Mini / Surface)
- **Desktop Viewport:** `1440 x 900` (MacBook / Large Screen)

Key test flows covered:
- Guest Mode initialization and zero-login playability
- Hunter account registration, cat avatar selection, and session persistence across page reload
- Camera scanner view, fallback barcode input, and catalog creation
- Pet fainted/dead state triggering upon reaching 0 hunger, verifying spirit rendering and revive workflow
- Theme selector and instant background switching

### Static Analysis

```bash
npx tsc --noEmit
```
Compiled with 0 errors under TypeScript strict mode.

---

## Soundtrack Attribution

All in-game background music tracks are royalty-free lo-fi compositions used with proper attribution:

| Slot | Track Title | Artist | Default Loop Description |
|:---:|:---|:---|:---|
| **BGM 1** | **Soaked** | Pufino | Loop Track 1 (Pufino - Soaked) continuously |
| **BGM 2** | **Kyoto** | Nebulite | Loop Track 2 (Nebulite - Kyoto) continuously |
| **BGM 3** | **Bread** | Lukrembo | Loop Track 3 (Lukrembo - Bread) continuously |
| **BGM 4** | **Honey Jam** | Massobeats | Loop Track 4 (Massobeats - Honey Jam) continuously |

---

## Local Development Setup

### Prerequisites

- Node.js `20.x` or higher
- npm or pnpm
- A Supabase account (or local PostgreSQL instance)

### 1. Clone the Repository

```bash
git clone https://github.com/reykadiva/scan-chan.git
cd scan-chan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Cloud Project Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# Database Connection Strings (Prisma)
DATABASE_URL="postgresql://postgres.your-project:password@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.your-project:password@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

### 4. Database Setup

Push the Prisma schema to your database or run the SQL migration:

```bash
npx prisma generate
npx prisma db push
```

*(Optional) Seed the database with sample products:*
```bash
npm run db:seed
```

### 5. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment on Vercel

Scan-Chan is optimized for deployment on the **Vercel** platform:

1. Push your code to your GitHub repository.
2. Import the project into Vercel.
3. In Project Settings -> Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy. The `postinstall` script in `package.json` automatically triggers `prisma generate` during the Vercel build phase.

---

## Authors & Acknowledgments

- **Lead Developer & Creator:** [Reyka Diva](https://github.com/reykadiva)
- **External Data Source:** [Open Food Facts](https://world.openfoodfacts.org/) for crowdsourced international product information
- **Music Creators:** Pufino, Nebulite, Lukrembo, and Massobeats for their creative commons audio works
- **Libraries:** `@zxing/library`, `zustand`, `@supabase/ssr`, `prisma`, `motion`

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.
