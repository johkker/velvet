# Boost System Redesign Plan - Dual Pricing Model

**Document Version:** 1.0  
**Created:** 2026-01-03  
**Status:** Planning Phase  
**Last Updated:** 2026-01-03

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Proposed New System](#proposed-new-system)
4. [Pricing Strategy](#pricing-strategy)
5. [Database Schema Changes](#database-schema-changes)
6. [Implementation Phases](#implementation-phases)
7. [Testing Checklist](#testing-checklist)
8. [Migration & Rollback Plan](#migration--rollback-plan)
9. [Decisions & Assumptions](#decisions--assumptions)
10. [Timeline & Effort](#timeline--effort)

---

## Executive Summary

Currently, the boost system treats all users (talents and establishments) equally with unified pricing. This redesign introduces a dual-pricing model that:

- **Keeps talent boosts unchanged** for individual talent profile visibility
- **Introduces establishment boosts** with higher pricing for establishment profile visibility
- **Enables bulk talent boosting** with configurable volume discounts
- Allows establishments to manage and promote multiple talents simultaneously

### Key Goals
- ✅ Increase revenue from establishment boosts (60-70% higher pricing)
- ✅ Incentivize bulk purchases through volume discounts (10-30%)
- ✅ Maintain backward compatibility with existing talent boosts
- ✅ Reduce user friction with clear, simple UX
- ✅ Enable future analytics on establishment vs talent visibility

---

## Current State Analysis

### Existing Boost System
```
Single boost type for all users
├── Same pricing for talents and establishments
├── One active boost per user at a time
├── No talent selection or bulk options
└── No volume discounts
```

### Current Database Structure
```
boosts table:
├── id (UUID, PK)
├── talent_id (UUID, FK to talents - NOT NULL)
├── type (ENUM: 'basic', 'premium', 'elite')
├── start_at (TIMESTAMP)
├── end_at (TIMESTAMP)
├── duration_days (INTEGER)
├── payment_id (UUID, FK to payments)
├── status (ENUM: 'PENDING', 'ACTIVE', 'EXPIRED')
├── created_at (TIMESTAMP)
└── [boost-specific fields]

payments table:
├── id (UUID, PK)
├── boost_id (UUID, FK to boosts)
├── provider (VARCHAR)
├── provider_payment_id (VARCHAR)
├── amount_cents (BIGINT)
├── currency (VARCHAR)
├── status (ENUM: 'PENDING', 'COMPLETED', 'FAILED')
├── metadata (JSONB) ← Can store additional info
└── [timestamps]
```

### Current Pricing
```
All Users (Talents & Establishments):
├── Basic:   R$ 49   / 7 days
├── Premium: R$ 89   / 15 days
└── Elite:   R$ 149  / 30 days
```

### Current Frontend Flow
```
boosts/page.tsx (Unified)
├── Shows 3 tier cards
├── Purchase button creates boost
└── PaymentModal handles payment
```

### Current Backend Flow
```
BoostsController
├── POST /boosts → creates single boost
└── GET /boosts/active → returns user's active boost

BoostsService
├── createBoost(talentId, tier)
└── getActiveBoost(userId)
```

---

## Proposed New System

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              UNIFIED BOOST SYSTEM                        │
└─────────────────────────────────────────────────────────┘
          ↓                               ↓
    ┌─────────────┐               ┌──────────────────┐
    │ TALENT BOOST│               │ ESTABLISHMENT    │
    │ (Unchanged) │               │ BOOST (New)      │
    └─────────────┘               └──────────────────┘
          ↓                          ↓              ↓
      Individual                 Profile      Bulk Talents
      Talent                      Boost       (Multi-select)
      Profile                     (Single)    (w/ Discounts)
```

### Boost Types

#### 1. **TALENT** (Existing - No Changes)
- **Target:** Individual talent profile visibility
- **User:** Talents (TALENT role)
- **Selection:** Automatic (own talent)
- **Pricing:** Unchanged
- **Active Limit:** One per talent at a time
- **Analytics:** Track boost impact on profile views

#### 2. **ESTABLISHMENT_PROFILE** (New)
- **Target:** Establishment profile visibility
- **User:** Establishments (ESTABLISHMENT role)
- **Selection:** Single establishment (automatic - their own)
- **Pricing:** Higher tier (60-70% increase)
- **Active Limit:** One per establishment at a time
- **Analytics:** Track boost impact on talent applications

#### 3. **TALENT_BULK** (New)
- **Target:** Multiple talent visibility (via establishment management)
- **User:** Establishments managing talents
- **Selection:** Multi-select from managed talent list
- **Pricing:** Per-talent with volume discounts
- **Active Limit:** Multiple boosts (one per talent)
- **Batch Processing:** Single payment for multiple talents
- **Analytics:** Track which talent combinations are boosted

---

## Pricing Strategy

### TALENT Boost (Keep Current)
**Purpose:** Highlight individual talent profile in search results  
**Target User:** Talents (TALENT role)

| Tier | Duration | Price (BRL) | Price (cents) | Notes |
|------|----------|-------------|---------------|-------|
| Basic | 7 days | R$ 49,00 | 4,900 | Entry level |
| Premium | 15 days | R$ 89,00 | 8,900 | Most popular |
| Elite | 30 days | R$ 149,00 | 14,900 | Best value |

**Price per Day:** R$ 7.00 - R$ 4.97/day

---

### ESTABLISHMENT_PROFILE Boost (New - Premium Pricing)
**Purpose:** Highlight establishment profile in search + home page  
**Target User:** Establishments (ESTABLISHMENT role)  
**Pricing Markup:** +60-70% vs Talent boost

| Tier | Duration | Price (BRL) | Price (cents) | Markup | Notes |
|------|----------|-------------|---------------|---------|-------|
| Basic | 7 days | R$ 79,00 | 7,900 | +61% | Higher visibility |
| Premium | 15 days | R$ 149,00 | 14,900 | +68% | Featured placement |
| Elite | 30 days | R$ 249,00 | 24,900 | +67% | Maximum exposure |

**Price per Day:** R$ 11.29 - R$ 8.30/day  
**Rationale:** Establishments have higher conversion value & better ROI

---

### TALENT_BULK Boost (New - Volume Discounts)
**Purpose:** Boost multiple talents with single payment  
**Target User:** Establishments managing multiple talents  
**Base Pricing:** Same as TALENT boost per talent  
**Volume Discounts:** Applied per total talent count

#### Pricing Tables by Talent Count

##### **1 Talent (No Discount)**
| Tier | Price | Per Talent | Total |
|------|-------|-----------|-------|
| Basic | R$ 49 | R$ 49 | R$ 49 |
| Premium | R$ 89 | R$ 89 | R$ 89 |
| Elite | R$ 149 | R$ 149 | R$ 149 |

##### **2-3 Talents (10% Discount)**
| Tier | Per Talent | 2 Talents | 3 Talents |
|------|-----------|-----------|-----------|
| Basic | R$ 44 | R$ 88 | R$ 132 |
| Premium | R$ 80 | R$ 160 | R$ 240 |
| Elite | R$ 134 | R$ 268 | R$ 402 |

**Calculation:** R$ 49 × 0.90 = R$ 44.10 (rounded to R$ 44)

##### **4-5 Talents (20% Discount)**
| Tier | Per Talent | 4 Talents | 5 Talents |
|------|-----------|-----------|-----------|
| Basic | R$ 39 | R$ 156 | R$ 195 |
| Premium | R$ 71 | R$ 284 | R$ 355 |
| Elite | R$ 119 | R$ 476 | R$ 595 |

**Calculation:** R$ 49 × 0.80 = R$ 39.20 (rounded to R$ 39)

##### **6+ Talents (30% Discount)**
| Tier | Per Talent | 6 Talents | 10 Talents | 20 Talents |
|------|-----------|-----------|------------|------------|
| Basic | R$ 34 | R$ 204 | R$ 340 | R$ 680 |
| Premium | R$ 62 | R$ 372 | R$ 620 | R$ 1,240 |
| Elite | R$ 104 | R$ 624 | R$ 1,040 | R$ 2,080 |

**Calculation:** R$ 49 × 0.70 = R$ 34.30 (rounded to R$ 34)

#### Discount Tiers Summary
```
Volume Discounts:
├── 1 talent:   0% discount (baseline)
├── 2-3 talents: 10% discount
├── 4-5 talents: 20% discount
└── 6+ talents:  30% discount (max)
```

#### Bulk Purchase Examples
```
Example 1: Establishment boosts 3 talents for Premium (15 days)
├── Base price: R$ 89 × 3 = R$ 267
├── Discount (10%): -R$ 26.70
└── Final: R$ 240.30

Example 2: Establishment boosts 5 talents for Elite (30 days)
├── Base price: R$ 149 × 5 = R$ 745
├── Discount (20%): -R$ 149
└── Final: R$ 596

Example 3: Establishment boosts 10 talents for Basic (7 days)
├── Base price: R$ 49 × 10 = R$ 490
├── Discount (30%): -R$ 147
└── Final: R$ 343
```

---

## Database Schema Changes

### Phase 1: Migrations Required

#### Migration File: `1767459619510-AddBoostTypeAndMultiTalent.ts`

**Status:** Not Yet Created  
**Dependencies:** Current migration `1767459619509-InitialSchema.ts`

### Schema Modifications

#### 1. **Boosts Table - Add New Columns**

```sql
-- Add boost_type column
ALTER TABLE "velvet_dev"."boosts" 
ADD COLUMN IF NOT EXISTS "boost_type" VARCHAR(50) DEFAULT 'TALENT';

-- Add establishment_id for ESTABLISHMENT_PROFILE boosts
ALTER TABLE "velvet_dev"."boosts" 
ADD COLUMN IF NOT EXISTS "establishment_id" UUID;

-- Add talent_ids for TALENT_BULK boosts
ALTER TABLE "velvet_dev"."boosts" 
ADD COLUMN IF NOT EXISTS "talent_ids" JSONB;

-- Make talent_id nullable (ESTABLISHMENT_PROFILE boosts don't have single talent)
ALTER TABLE "velvet_dev"."boosts" 
ALTER COLUMN "talent_id" DROP NOT NULL;

-- Add constraints and indexes
ALTER TABLE "velvet_dev"."boosts"
ADD CONSTRAINT "check_boost_type_valid" 
CHECK ("boost_type" IN ('TALENT', 'ESTABLISHMENT_PROFILE', 'TALENT_BULK'));

-- Ensure at least one target is specified
ALTER TABLE "velvet_dev"."boosts"
ADD CONSTRAINT "check_boost_has_target"
CHECK (
  ("boost_type" = 'TALENT' AND "talent_id" IS NOT NULL) OR
  ("boost_type" = 'ESTABLISHMENT_PROFILE' AND "establishment_id" IS NOT NULL) OR
  ("boost_type" = 'TALENT_BULK' AND "talent_ids" IS NOT NULL)
);

-- Add foreign key for establishment_id
ALTER TABLE "velvet_dev"."boosts"
ADD CONSTRAINT "FK_boosts_establishment_id"
FOREIGN KEY ("establishment_id") REFERENCES "velvet_dev"."establishments" ("id") 
ON DELETE CASCADE ON UPDATE NO ACTION;

-- Add indexes for query performance
CREATE INDEX IF NOT EXISTS "IDX_boosts_boost_type" 
ON "velvet_dev"."boosts" ("boost_type");

CREATE INDEX IF NOT EXISTS "IDX_boosts_establishment_id" 
ON "velvet_dev"."boosts" ("establishment_id");

CREATE INDEX IF NOT EXISTS "IDX_boosts_talent_ids" 
ON "velvet_dev"."boosts" USING GIN ("talent_ids");
```

#### 2. **Payments Table - No Changes Required**
The `metadata` JSONB column already exists and can store:
```json
{
  "boost_type": "TALENT_BULK",
  "talent_count": 3,
  "talent_ids": ["id1", "id2", "id3"],
  "discount_percentage": 10,
  "original_amount": 26700,
  "discounted_amount": 24030
}
```

### Updated Entity Relationships

```
User (TALENT role)
  └── Boosts (boost_type = 'TALENT')
      └── talent_id (explicit link)

User (ESTABLISHMENT role)
  ├── Establishments
  │   ├── Boosts (boost_type = 'ESTABLISHMENT_PROFILE')
  │   │   └── establishment_id (self-reference through establishment)
  │   └── Talents (managed talents relationship - Future Feature)
  │
  └── Boosts (boost_type = 'TALENT_BULK')
      ├── establishment_id
      └── talent_ids (JSON array)
```

### Data Migration for Existing Boosts

All existing boosts will automatically have:
```
boost_type = 'TALENT' (default)
establishment_id = NULL
talent_ids = NULL
```

No data transformation needed - backward compatible.

---

## Implementation Phases

### PHASE 1: Database & Entity Updates (2 hours)

**Objective:** Set up database schema and update ORM entities  
**Status:** `NOT STARTED`

#### Tasks

- [ ] Create migration file: `1767459619510-AddBoostTypeAndMultiTalent.ts`
  - [ ] Add boost_type column with enum
  - [ ] Add establishment_id column with FK
  - [ ] Add talent_ids column as JSONB
  - [ ] Make talent_id nullable
  - [ ] Add constraints (check_boost_type_valid, check_boost_has_target)
  - [ ] Add indexes for query performance
  - [ ] Test migration up and down

- [ ] Update `src/modules/boosts/entities/boost.entity.ts`
  - [ ] Add BoostType enum (TALENT, ESTABLISHMENT_PROFILE, TALENT_BULK)
  - [ ] Add @Column('enum', { enum: BoostType }) boostType
  - [ ] Add @Column('uuid', { nullable: true }) establishmentId
  - [ ] Add @Column('jsonb', { nullable: true }) talentIds
  - [ ] Update @ManyToOne relationship for talent_id to be optional
  - [ ] Add @ManyToOne relationship for establishment_id
  - [ ] Add helper methods:
    - `isTalentBoost(): boolean`
    - `isEstablishmentBoost(): boolean`
    - `isBulkBoost(): boolean`

- [ ] Update `src/modules/boosts/dto/create-boost.dto.ts`
  - [ ] Add boostType field (required)
  - [ ] Add talentIds array (optional)
  - [ ] Add establishmentId (optional)
  - [ ] Add validation decorators:
    - `@IsEnum(BoostType)`
    - `@IsOptional() @IsArray() talentIds`
    - Conditional validation: if boostType is TALENT, require talentId; etc.

- [ ] Update `src/modules/boosts/dto/boost-response.dto.ts`
  - [ ] Include boostType in response
  - [ ] Include establishment details if ESTABLISHMENT_PROFILE
  - [ ] Include talent details if TALENT_BULK

#### Verification
```bash
# Run migrations
npm run migration:run

# Verify schema
docker exec velvet_postgres psql -U velvet -d velvet_db -c \
  "SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name='boosts' AND schema_name='velvet_dev';"

# Build should not have errors
npm run build
```

---

### PHASE 2: Backend - Services & Business Logic (4 hours)

**Objective:** Implement pricing logic, validation, and boost creation  
**Status:** `NOT STARTED`
**Depends On:** Phase 1 Complete

#### Tasks

- [ ] Create pricing configuration: `src/config/pricing.ts`
  ```typescript
  export const PRICING = {
    TALENT: {
      basic: { days: 7, priceInCents: 4900 },
      premium: { days: 15, priceInCents: 8900 },
      elite: { days: 30, priceInCents: 14900 }
    },
    ESTABLISHMENT_PROFILE: {
      basic: { days: 7, priceInCents: 7900 },
      premium: { days: 15, priceInCents: 14900 },
      elite: { days: 30, priceInCents: 24900 }
    },
    TALENT_BULK: {
      basic: { days: 7, priceInCents: 4900 },
      premium: { days: 15, priceInCents: 8900 },
      elite: { days: 30, priceInCents: 14900 }
    },
    VOLUME_DISCOUNTS: {
      1: 0.00,    // No discount for 1 talent
      2: 0.10,    // 10% for 2-3
      3: 0.10,
      4: 0.20,    // 20% for 4-5
      5: 0.20,
      6: 0.30     // 30% for 6+
    }
  };
  ```

- [ ] Create pricing service: `src/modules/boosts/services/pricing.service.ts`
  - [ ] `getBasePriceInCents(boostType: BoostType, tier: string): number`
  - [ ] `getVolumeDiscount(talentCount: number): number`
    - Return 0-0.30 based on talent count
    - Support 6+ talents (30% max)
  - [ ] `calculateTotalPrice(tier: string, boostType: BoostType, talentCount: number): { basePrice: number, discount: number, finalPrice: number }`
    - Formula: basePrice = pricePerTalent × talentCount
    - discount = basePrice × discountPercentage
    - finalPrice = basePrice - discount
  - [ ] `getPricingTiers(userRole: 'TALENT' | 'ESTABLISHMENT'): PricingTier[]`
    - Return different tiers based on role
    - For ESTABLISHMENT, include both PROFILE and BULK options
  - [ ] Unit tests for all discount calculations

- [ ] Update `src/modules/boosts/services/boosts.service.ts`
  - [ ] `getPricingTiers(userId: string): Promise<PricingTier[]>`
    - Fetch user role
    - Return appropriate pricing based on role
  - [ ] `createBoost(createBoostDto: CreateBoostDto, userId: string): Promise<Boost>`
    - Validate boostType matches user role
    - Call `validateTalentOwnership()` if TALENT_BULK
    - For TALENT_BULK, create individual boosts for each talent
    - Link all boosts to single payment
    - Return payment details
  - [ ] `validateTalentOwnership(establishmentId: string, talentIds: string[]): Promise<boolean>`
    - Verify establishment manages all selected talents
    - Throw error if any talent not owned
  - [ ] `getActiveBoosts(userId: string): Promise<Boost[]>`
    - Return all active boosts for user
    - Include role-appropriate type filtering
  - [ ] `getManagedTalents(establishmentId: string): Promise<Talent[]>`
    - Fetch talents managed by establishment
    - Return only available talents (not already boosted? - TBD)

- [ ] Update `src/modules/boosts/controllers/boosts.controller.ts`
  - [ ] `GET /boosts/pricing`
    - Returns pricing tiers for authenticated user
    - Different response for TALENT vs ESTABLISHMENT
    - For ESTABLISHMENT: include options to boost profile or talents
  - [ ] `POST /boosts/validate-price`
    - Request: { boostType, tier, talentIds? }
    - Response: { basePriceInCents, discountPercentage, discountInCents, finalPriceInCents }
    - No side effects, just calculation
  - [ ] `POST /boosts`
    - Updated to handle all boost types
    - Creates boost(s) and returns payment details
  - [ ] `GET /boosts/managed-talents` (ESTABLISHMENT only)
    - Returns list of talents managed by establishment
    - Include boost status for each
  - [ ] Error handling for invalid talent selections

- [ ] Add validation logic
  - [ ] Talent ownership validation
  - [ ] Duplicate boost prevention (only one active boost per target)
  - [ ] Talent count limits (min 1, max 100?)
  - [ ] Business logic constraints

#### Verification
```bash
# Run tests
npm run test -- boosts

# Build and check
npm run build

# Manual test pricing calculation:
# Create test curl for /boosts/pricing and /boosts/validate-price
```

---

### PHASE 3: Frontend - UI Components & State Management (4 hours)

**Objective:** Create dual-mode boost page for talents vs establishments  
**Status:** `NOT STARTED`
**Depends On:** Phase 2 Complete

#### Tasks

- [ ] Create component: `src/components/organisms/TalentBoostModal.tsx`
  - This is the current boost page content
  - Extract into reusable component
  - Show only for users with TALENT role
  - Keep current UX unchanged

- [ ] Create component: `src/components/organisms/EstablishmentBoostModal.tsx` (New)
  - Step 1: Choose boost type
    - Radio buttons: "Boost Establishment Profile" vs "Boost Managed Talents"
  - Step 2: If "Boost Managed Talents"
    - Multi-select dropdown/list of managed talents
    - Show real-time price calculation
    - Highlight discount tier as talents selected
  - Step 3: Review & confirm
    - Show total price with breakdown
    - Display discount amount and percentage
  - Step 4: Payment
    - Proceed to PaymentModal with calculated amount
  - Features:
    - Real-time price updates on talent selection
    - Show discount badge when applicable
    - Disable non-owned talents
    - Show if establishment has no managed talents

- [ ] Update `src/app/dashboard/boosts/page.tsx`
  - [ ] Add user role check at top
  - [ ] Conditionally render:
    - `<TalentBoostModal />` if TALENT role
    - `<EstablishmentBoostSelector />` if ESTABLISHMENT role
  - [ ] Keep current loading/error states
  - [ ] Add API call to fetch pricing based on role

- [ ] Create component: `src/components/molecules/TalentMultiSelect.tsx`
  - Multi-select dropdown with checkboxes
  - Show talent photos/names
  - Live search/filter
  - Show "No talents available" message if empty
  - Display selected count

- [ ] Create component: `src/components/molecules/PriceBreakdown.tsx`
  - Display: Base price, discount %, discount amount, final price
  - Color code discounts (gold for active discount)
  - Show per-talent price

- [ ] Update `src/lib/api.ts`
  - [ ] `getBoostPricing(): Promise<PricingTier[]>`
    - GET /boosts/pricing
  - [ ] `validateBoostPrice(boostType, tier, talentIds?): Promise<PriceBreakdown>`
    - POST /boosts/validate-price
  - [ ] `createBoost(boostData): Promise<PaymentData>`
    - POST /boosts
  - [ ] `getManagedTalents(): Promise<Talent[]>`
    - GET /boosts/managed-talents

- [ ] Update CSS files
  - [ ] `src/app/dashboard/boosts/page.css`
    - Add styles for multi-select
    - Add styles for talent selection UI
    - Add discount badge styles
  - [ ] Create `src/components/molecules/TalentMultiSelect.css`
  - [ ] Create `src/components/molecules/PriceBreakdown.css`

- [ ] Add state management in component
  - Use React hooks (useState, useEffect)
  - selectedTalents: string[]
  - boostType: 'TALENT' | 'ESTABLISHMENT_PROFILE' | 'TALENT_BULK'
  - pricing: PricingTier[]
  - loading, error states
  - Real-time price calculation

#### Verification
```bash
# Build frontend
npm run build

# Manual testing:
# - Login as TALENT, verify old boost page shows
# - Login as ESTABLISHMENT, verify new dual-mode shows
# - Select 1, 2, 3, 6+ talents and verify discount updates
# - Verify price calculations match backend
```

---

### PHASE 4: Payment & Integration Testing (2 hours)

**Objective:** Integrate with payment system and end-to-end testing  
**Status:** `NOT STARTED`
**Depends On:** Phases 1-3 Complete

#### Tasks

- [ ] Update `src/components/organisms/PaymentModal.tsx`
  - [ ] Accept boostType and talentIds in props
  - [ ] Calculate amount based on received boostType
  - [ ] Display discount breakdown in payment summary
  - [ ] Pass boost metadata to Abacate Pay
  - [ ] Handle success/failure appropriately

- [ ] Update Abacate Pay integration
  - [ ] Ensure metadata includes:
    - `boost_type`: string
    - `talent_count`: number (if applicable)
    - `talent_ids`: string[] (if applicable)
    - `discount_percentage`: number
    - `original_amount`: number (before discount)
  - [ ] Webhook handler validates boost_type
  - [ ] Test with Abacate Pay sandbox

- [ ] Create payment test scenarios
  - [ ] Test 1: TALENT boost basic payment
  - [ ] Test 2: ESTABLISHMENT_PROFILE boost payment
  - [ ] Test 3: TALENT_BULK (2 talents) with 10% discount
  - [ ] Test 4: TALENT_BULK (6 talents) with 30% discount
  - [ ] Test 5: Payment failure handling

- [ ] Database verification
  - [ ] Verify boosts created with correct boost_type
  - [ ] Verify talent_ids stored as JSON
  - [ ] Verify establishment_id populated correctly
  - [ ] Query: All boosts by establishment_id returns correct records

- [ ] API endpoint verification
  - [ ] GET /boosts/pricing returns role-specific tiers
  - [ ] POST /boosts/validate-price calculates correctly
  - [ ] POST /boosts creates correct boost records
  - [ ] GET /boosts/managed-talents returns owned talents

- [ ] Frontend validation
  - [ ] Pricing updates in real-time as talents selected
  - [ ] Discounts display correctly
  - [ ] Modal flows work end-to-end
  - [ ] Payment processed successfully

#### Manual Testing Checklist
```
[ ] TALENT User:
  [ ] Can access boost page
  [ ] Sees TALENT boost pricing only
  [ ] Can purchase Basic/Premium/Elite
  [ ] Payment succeeds
  [ ] Boost appears in active boosts

[ ] ESTABLISHMENT User (no managed talents):
  [ ] Can access boost page
  [ ] Sees two options: Profile Boost and Talent Boost
  [ ] Cannot select talents (none available)
  [ ] Can purchase ESTABLISHMENT_PROFILE boost only
  [ ] Payment succeeds

[ ] ESTABLISHMENT User (with 5 managed talents):
  [ ] Can access boost page
  [ ] Can select multiple talents
  [ ] 1 talent: no discount shown
  [ ] 2 talents: 10% discount shows
  [ ] 3 talents: 10% discount shows
  [ ] 4 talents: 20% discount shows
  [ ] 5 talents: 20% discount shows
  [ ] Price calculation matches expected
  [ ] Can purchase with correct amount
  [ ] Payment succeeds
  [ ] All 5 boosts created in database

[ ] ESTABLISHMENT User (with 10 managed talents):
  [ ] Can select up to 10 talents
  [ ] 6 talents: 30% discount shows
  [ ] Final price correct
  [ ] Purchase succeeds

[ ] Backward Compatibility:
  [ ] Existing TALENT boosts still work
  [ ] Pricing unchanged for talent boosts
  [ ] Old boost records have boost_type='TALENT'
```

---

## Testing Checklist

### Unit Tests

#### Services
- [ ] `PricingService.getVolumeDiscount()`
  - [ ] 1 talent → 0%
  - [ ] 2 talents → 10%
  - [ ] 3 talents → 10%
  - [ ] 4 talents → 20%
  - [ ] 5 talents → 20%
  - [ ] 6 talents → 30%
  - [ ] 100 talents → 30%

- [ ] `PricingService.calculateTotalPrice()`
  - [ ] TALENT/BASIC: R$ 49
  - [ ] ESTABLISHMENT_PROFILE/BASIC: R$ 79
  - [ ] TALENT_BULK/BASIC (2 talents): R$ 88
  - [ ] TALENT_BULK/PREMIUM (3 talents): R$ 240
  - [ ] TALENT_BULK/ELITE (6 talents): R$ 624

- [ ] `BoostsService.validateTalentOwnership()`
  - [ ] Owned talents: return true
  - [ ] Non-owned talent in selection: throw error
  - [ ] Empty talent list: throw error
  - [ ] Null/undefined handling

### Integration Tests

- [ ] E2E: TALENT boost creation
  - [ ] POST /boosts with TALENT role
  - [ ] Validates pricing
  - [ ] Creates boost record
  - [ ] Returns payment link

- [ ] E2E: ESTABLISHMENT_PROFILE boost creation
  - [ ] POST /boosts with ESTABLISHMENT role
  - [ ] Creates single boost
  - [ ] Links to establishment_id
  - [ ] Returns payment link

- [ ] E2E: TALENT_BULK boost creation (3 talents)
  - [ ] POST /boosts with TALENT_BULK type
  - [ ] Creates 3 boost records
  - [ ] All linked to same payment
  - [ ] Discount calculated correctly
  - [ ] Final price accurate

- [ ] Pricing API endpoint
  - [ ] TALENT user → TALENT pricing only
  - [ ] ESTABLISHMENT user → Both PROFILE and BULK options
  - [ ] Response format matches spec

### UI/E2E Tests

- [ ] Talent boost page (unchanged)
  - [ ] Shows same 3 tiers
  - [ ] Can purchase each tier
  - [ ] Payment processes

- [ ] Establishment boost modal
  - [ ] Shows two boost type options
  - [ ] Can select Profile or Talents
  - [ ] Multi-select works correctly
  - [ ] Real-time price updates
  - [ ] Discount badges appear/disappear correctly
  - [ ] Can proceed to payment
  - [ ] Payment succeeds

### Regression Tests

- [ ] Existing TALENT boosts unaffected
  - [ ] Query existing boosts: boost_type = 'TALENT'
  - [ ] Can still query by talent_id
  - [ ] Pricing unchanged
  - [ ] API backward compatible

- [ ] Payment system
  - [ ] Old payment links still work
  - [ ] Webhook validation unchanged
  - [ ] Payment history intact

---

## Migration & Rollback Plan

### Pre-Production Checklist

- [ ] Database backup created
  - [ ] Full dump of production DB
  - [ ] Stored securely
  - [ ] Verified restorable

- [ ] Migration tested on staging
  - [ ] Run migration up
  - [ ] Verify schema changes
  - [ ] Test all queries
  - [ ] Run migration down
  - [ ] Verify rollback works

- [ ] Code review completed
  - [ ] All phases reviewed
  - [ ] Tests passing
  - [ ] No TypeScript errors
  - [ ] API contracts validated

- [ ] Communication plan
  - [ ] Notify users of new features
  - [ ] Document pricing changes
  - [ ] Create help articles

### Deployment Steps

1. **Pre-deployment** (5 min)
   - [ ] Backup database
   - [ ] Stop automated jobs
   - [ ] Alert monitoring

2. **Deploy Backend** (10 min)
   - [ ] Deploy new code
   - [ ] Run migrations: `npm run migration:run`
   - [ ] Verify no errors in logs

3. **Deploy Frontend** (5 min)
   - [ ] Deploy new UI
   - [ ] Clear CDN cache
   - [ ] Verify page loads

4. **Verification** (15 min)
   - [ ] Check database for new columns
   - [ ] Test API endpoints manually
   - [ ] Test boost creation for both roles
   - [ ] Verify existing boosts unaffected

5. **Post-deployment** (5 min)
   - [ ] Resume automated jobs
   - [ ] Update monitoring alerts
   - [ ] Announce to users

### Rollback Procedure

If critical issues discovered within 1 hour of deployment:

1. **Stop all boost operations** (immediately)
   - Disable boost endpoints
   - Set maintenance message

2. **Rollback database** (15 min)
   ```bash
   npm run migration:revert
   # Or restore from backup
   ```

3. **Rollback code** (5 min)
   - Deploy previous version
   - Clear cache

4. **Verify** (10 min)
   - Test old boost flow
   - Confirm existing boosts work

**Note:** This is a complex feature. Consider gradual rollout:
- [ ] Deploy to small % of establishments first
- [ ] Monitor for 2-3 hours
- [ ] Gradually increase to 100%

---

## Decisions & Assumptions

### Architectural Decisions

| Decision | Reasoning | Alternatives Considered |
|----------|-----------|------------------------|
| **Separate Boosts per Type** | Simpler logic, easier to manage | Could use single boost with multiple targets |
| **Single Payment for Bulk** | Reduces payment processing fees | Could charge per talent separately |
| **30% Max Discount** | Encourages large bulk purchases while maintaining margin | Could go up to 50% |
| **Hardcoded Pricing** | Faster to deploy, can admin portal later | Could make dynamic from day one |
| **Talent IDs in JSONB** | Flexible, queryable in PostgreSQL | Could use junction table (more complex) |
| **Dual-mode Boost Page** | Simpler UX flow | Could have separate pages per role |

### Assumptions

1. **Talent Ownership:**
   - Assume establishment-talent relationship exists (Future Feature TBD)
   - For now, any establishment can boost any talent if they want
   - **Risk:** Need to finalize how establishments "manage" talents

2. **One Active Boost Per Target:**
   - Assume only one active boost per talent/establishment at a time
   - Establishment cannot boost same talent twice simultaneously
   - **Risk:** Need to define behavior if user tries to re-boost

3. **Payment Processing:**
   - Abacate Pay can handle metadata updates
   - Webhook validates boost_type exists
   - **Risk:** Need to coordinate with payment provider

4. **Analytics:**
   - Can track boost performance via metadata
   - Future: analytics dashboard shows boost ROI
   - **Risk:** May need additional tracking infrastructure

5. **Pricing Finality:**
   - Prices listed are final and approved
   - No further changes expected
   - **Risk:** If pricing changes, would need config migration

### Open Questions

| Question | Decision | Status |
|----------|----------|--------|
| How do establishments "manage" talents? | Need talent relationship system | `BLOCKED - FUTURE FEATURE` |
| Can establishment boost unrelated talent? | Out of scope for now | `DEFERRED` |
| Should talent see establishment boosts? | No, separate systems | `DECIDED` |
| How to handle payment disputes? | Standard payment provider policy | `OUT OF SCOPE` |
| Do we need A/B testing? | Phase 2 feature | `DEFERRED` |

---

## Timeline & Effort

### Detailed Time Breakdown

#### Phase 1: Database (2 hours)
```
Migration file creation:        30 min
Entity updates:                 45 min
Testing & verification:         45 min
─────────────────────────────────────
Subtotal:                      120 min (2 hours)
```

#### Phase 2: Backend (4 hours)
```
Pricing configuration:          30 min
PricingService creation:        90 min
BoostsService updates:         90 min
BoostsController updates:      60 min
Validation logic:              30 min
─────────────────────────────────────
Subtotal:                      300 min (5 hours)
Buffer:                        -60 min (already optimistic)
─────────────────────────────────────
Total:                         240 min (4 hours)
```

#### Phase 3: Frontend (4 hours)
```
Component extraction:           45 min
EstablishmentBoostModal:       90 min
TalentMultiSelect component:   60 min
PriceBreakdown component:      45 min
API integration:               45 min
CSS & styling:                 45 min
State management:              30 min
─────────────────────────────────────
Subtotal:                      360 min (6 hours)
Buffer:                        -120 min (scope reduced)
─────────────────────────────────────
Total:                         240 min (4 hours)
```

#### Phase 4: Integration & Testing (2 hours)
```
Payment integration:            30 min
E2E testing:                   60 min
Bug fixes:                     20 min
Documentation:                 10 min
─────────────────────────────────────
Subtotal:                      120 min (2 hours)
```

### Project Timeline

```
Day 1 (2026-01-04):
├─ Morning: Phase 1 (Database) - 2 hours
└─ Afternoon: Phase 2 (Backend) - 2 hours
  
Day 2 (2026-01-05):
├─ Morning: Phase 2 (Backend) - 2 hours continuation
├─ Afternoon: Phase 3 (Frontend) - 4 hours
└─ Evening: Initial testing

Day 3 (2026-01-06):
├─ Morning: Phase 4 (Integration & Testing) - 2 hours
├─ Afternoon: Fixes & refinements - 2 hours
└─ Evening: Final verification

Deployment: 2026-01-07 (morning)
```

**Total Effort:** 12 hours (1.5 days of focused development)

---

## Progress Tracking

### Status Legend
- ⭕ Not Started
- 🔵 In Progress
- 🟢 Completed
- 🔴 Blocked
- 🟡 Paused

### Phase 1: Database & Entity Updates
**Target Start:** TBD  
**Target End:** TBD  
**Status:** ⭕ Not Started

- ⭕ Create migration file
- ⭕ Update Boost entity
- ⭕ Update DTOs
- ⭕ Test migration

### Phase 2: Backend Services
**Target Start:** TBD  
**Target End:** TBD  
**Status:** ⭕ Not Started

- ⭕ Create pricing configuration
- ⭕ Create PricingService
- ⭕ Update BoostsService
- ⭕ Update BoostsController
- ⭕ Add validation logic

### Phase 3: Frontend Components
**Target Start:** TBD  
**Target End:** TBD  
**Status:** ⭕ Not Started

- ⭕ Create TalentBoostModal component
- ⭕ Create EstablishmentBoostModal component
- ⭕ Create TalentMultiSelect component
- ⭕ Create PriceBreakdown component
- ⭕ Update main boost page
- ⭕ Update API layer

### Phase 4: Integration & Testing
**Target Start:** TBD  
**Target End:** TBD  
**Status:** ⭕ Not Started

- ⭕ Integrate with payment system
- ⭕ E2E testing
- ⭕ Regression testing
- ⭕ Final verification

---

## Reference Materials

### Related Files
- API Spec: `/API_SPEC.md`
- Database Schema: `/DATABASE_SCHEMA.md`
- Development Plan: `/DEVELOPMENT_PLAN.md`
- Current Migrations: `/backend/src/migrations/`
- Current Boost Module: `/backend/src/modules/boosts/`
- Current Boost Page: `/frontend/src/app/dashboard/boosts/`

### Code Templates

#### Sample PricingService Implementation
```typescript
@Injectable()
export class PricingService {
  getVolumeDiscount(talentCount: number): number {
    if (talentCount <= 1) return 0;
    if (talentCount <= 3) return 0.10;
    if (talentCount <= 5) return 0.20;
    return 0.30;
  }

  calculateTotalPrice(
    basePrice: number,
    talentCount: number,
  ): { basePrice: number; discount: number; finalPrice: number } {
    const discount = this.getVolumeDiscount(talentCount);
    const totalBase = basePrice * talentCount;
    const totalDiscount = Math.round(totalBase * discount);
    return {
      basePrice: totalBase,
      discount: totalDiscount,
      finalPrice: totalBase - totalDiscount,
    };
  }
}
```

#### Sample Boost Entity
```typescript
@Entity('boosts')
export class Boost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { enum: BoostType, default: BoostType.TALENT })
  boostType: BoostType;

  @Column('uuid', { nullable: true })
  talentId: string;

  @Column('uuid', { nullable: true })
  establishmentId: string;

  @Column('jsonb', { nullable: true })
  talentIds: string[];

  // ... other fields
}
```

---

## Conclusion

This redesign provides:
- ✅ **Revenue Growth:** 60-70% higher establishment boost pricing
- ✅ **Customer Value:** 10-30% volume discounts for bulk purchases
- ✅ **Flexibility:** Three distinct boost types for different needs
- ✅ **Maintainability:** Clean separation of concerns, testable architecture
- ✅ **Backward Compatibility:** Existing boosts continue to work unchanged

**Ready to proceed with Phase 1 when approved.**

---

**Document Last Updated:** 2026-01-03 17:57 UTC  
**Next Review Date:** Upon Phase 1 Completion
