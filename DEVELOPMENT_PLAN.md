# Velvet Platform - Development Plan

## Project Overview

Velvet is a premium talent booking platform connecting clients with entertainment professionals (DJs, dancers, performers). Built with Next.js (frontend) and NestJS (backend).

## Core Features

### 1. User Management
- **Talents**: Create profiles, upload media, manage availability
- **Establishments**: Browse talents, send invitations, manage bookings
- **Authentication**: JWT-based auth with role-based access control

### 2. Profile System
- Rich profiles with photos, videos, descriptions
- Service pricing and availability
- Verification badges
- Public profile pages with SEO optimization

### 3. Boost System (Monetization) - REDESIGNED
- ✅ Phase 1: Backend infrastructure completed
  - Database schema updated with new columns and enums
  - Pricing configuration for all three boost types
  - Service layer with pricing and payment integration
  - API endpoints for talent, establishment, and bulk boosts
- ✅ Phase 2: Frontend implementation completed
  - Role-based boost page (talent vs establishment)
  - TalentBoostSection component with 4 tiers
  - EstablishmentBoostSection component with 3 tiers
  - TalentBulkBoostSection with multi-select and discount calculator
  - ActiveBoostBanner with real-time countdown
  - PaymentModal integration with PIX
- Features:
  - Talent boosts: 3d, 7d, 30d durations
  - Establishment boosts: 3d, 7d, 30d durations (1.5-1.53x markup)
  - Bulk talent boosts: 10%, 20%, 30% volume discounts
  - Real-time boost status and countdown timers
  - Full payment workflow with Abacate Pay

### 4. Establishment-Talent Management
- Establishments can send invitations to talents
- Talents accept/reject invitations
- Establishments manage multiple talents
- Establishments can purchase boosts for their managed talents
- Payment history tracking per establishment

### 5. Analytics & Metrics
- Profile view tracking (total + unique visitors)
- Contact button click tracking
- Search impression tracking
- Engagement rate calculation
- Boost impact analysis
- Historical data with period filtering (today, week, month, all time)
- Separate views for talents and establishments

### 6. Search & Discovery
- Advanced search with filters (location, services, price range)
- Boosted profiles appear first
- SEO-optimized public pages

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: CSS Modules with semantic classes
- **State**: React hooks
- **API**: REST API calls to backend

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT
- **Payments**: Abacate Pay webhook integration
- **API**: RESTful endpoints

## Current Status

### ✅ Completed
- User authentication (Talent + Establishment)
- Profile management (CRUD)
- Media upload and gallery
- Public profile pages
- Boost system with payment integration
- Establishment-Talent invitation system
- Analytics tracking infrastructure
- Metrics dashboard UI
- Payment history tracking

### 🚧 In Progress
- Advanced search filters
- Boost performance analytics
- Establishment dashboard refinements

### 📋 Planned
- Email notifications for invitations
- Boost performance analytics dashboard
- Advanced search filters with saved searches
- Rating and review system
- Booking calendar system
- Auto-renewal for boost subscriptions
- Mobile app (React Native)

## Architecture

### Database Schema
- **users**: Base user table
- **talents**: Talent-specific data
- **establishments**: Establishment-specific data
- **talent_media**: Photos/videos
- **boosts**: Active and historical boosts
- **establishment_talents**: Many-to-many relationship
- **analytics_events**: Raw event tracking
- **profile_views**: Aggregated view metrics
- **contact_clicks**: Aggregated interaction metrics
- **search_impressions**: Search appearance tracking

### API Structure
```
/api/auth          - Authentication endpoints
/api/talents       - Talent management
/api/establishments - Establishment management
/api/boosts        - Boost purchase and management
/api/analytics     - Metrics and tracking
/api/webhooks      - Payment webhooks
```

### Frontend Routes
```
/                  - Home page
/talents           - Public talent search
/talents/[slug]    - Public talent profile
/dashboard         - User dashboard
/dashboard/profile - Profile editing
/dashboard/media   - Media management
/dashboard/analytics - Metrics view
/dashboard/invitations - Invitation management (talents)
/dashboard/talents - Managed talents (establishments)
```

## Development Guidelines

### Code Style
- Use semantic CSS classes (no inline styles)
- Follow TypeScript strict mode
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep components small and focused

### Design System
- **Colors**: Neutral grays + Gold accent (#f59e0b)
- **Typography**: System fonts, clear hierarchy
- **Spacing**: 8px grid system
- **Components**: Reusable, accessible

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Manual testing for UI/UX

## Next Steps

1. ✅ Boost System Redesign - Phases 1 & 2 Complete
2. Advanced search filters and discovery improvements
3. Boost performance analytics and ROI tracking
4. Email notification system enhancements
5. Auto-renewal subscription management
6. Mobile optimization

## Resources

- **API Spec**: See `api_gateway_spec.md`
- **Style Guide**: See `style_guide_rewrite.md`
- **Data Architecture**: See `backend_data_architecture.md`
- **Payment Integration**: See `abacate_pay.yaml`

