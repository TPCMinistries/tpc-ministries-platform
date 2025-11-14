# TPC Ministries Platform

A comprehensive ministry discipleship ecosystem built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Overview

TPC Ministries Platform is a modern, full-featured web application designed to transform lives through Christ. The platform serves communities across Kenya, South Africa, and Grenada, offering faith-based content, community engagement, and discipleship resources.

## Features

- **Modern Homepage** - Beautiful landing page with hero section, mission locations, and latest teachings
- **Authentication System** - Secure user authentication powered by Supabase
- **Responsive Design** - Mobile-first design that works seamlessly across all devices
- **Mission Tracking** - Showcase global missions and their impact
- **Teaching Library** - Access to sermons and teaching resources
- **Member Dashboard** - Personalized experience for authenticated members
- **Admin Panel** - Content management and user administration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Authentication, Database, Storage)
- **Icons**: Lucide React
- **Payments**: Stripe (integration ready)

## Project Structure

```
tpc-ministries-platform/
├── app/
│   ├── (public)/          # Public pages (homepage, about, missions)
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (member)/          # Member dashboard
│   ├── (admin)/           # Admin panel
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components (Navigation, Footer)
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils/             # Helper functions
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (credentials already configured)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TPCMinistries/tpc-ministries-platform.git
cd tpc-ministries-platform
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env.local`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

The following environment variables are configured in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

## Design System

### Colors

- **Primary**: Deep Blue (#1e3a8a) - Trust, spirituality, stability
- **Accent**: Gold (#f59e0b) - Hope, warmth, divine light
- **Text**: Slate grays - Professional, readable
- **Backgrounds**: White with subtle gradients

### Typography

Clean, readable fonts with generous spacing for a warm, welcoming feel.

### Components

All UI components follow the shadcn/ui design system for consistency and accessibility.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The platform can be deployed to any hosting service that supports Next.js 14.

## Contributing

This is a private ministry project. For questions or contributions, please contact the ministry leadership.

## Support

For technical support or questions:
- Email: info@tpcministries.org
- Phone: +1 (555) 123-4567

## License

© 2025 TPC Ministries. All rights reserved.

---

Built with ❤️ for the Kingdom
