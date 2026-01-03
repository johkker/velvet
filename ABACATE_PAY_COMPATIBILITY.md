# Abacate Pay API - Boost System Compatibility Analysis

**Document Version:** 1.0  
**Created:** 2026-01-03  
**Status:** Pre-Implementation Review  
**API Version:** 1.0.0

---

## Executive Summary

✅ **FULLY COMPATIBLE** - The Abacate Pay API fully supports our dual-pricing boost system with no blockers identified.

**Key Capabilities:**
- Flexible metadata for custom data tracking
- Multiple products in single billing/payment
- Product-based pricing for volume discounts
- Customer management (inline or existing)
- PIX + CARD payment methods
- Sandbox environment for testing

---

## API Review Scope

**File Analyzed:** `/abacate_pay.yaml`  
**Endpoints Reviewed:** 15+ endpoints  
**Focus Areas:** Payment creation, metadata, bulk operations

---

## Relevant Endpoints for Boost System

### 1. **POST /billing/create** - Primary Payment Endpoint

**Purpose:** Create billing/payment requests for customers

**Key Features:**
```yaml
Request:
  - frequency: ONE_TIME | MULTIPLE_PAYMENTS
  - methods: [PIX, CARD]
  - products: Array of product objects
  - metadata: Object (additionalProperties: true) ✅
  - customerId or customer object
  - returnUrl, completionUrl
  
Response:
  - Billing object with payment link
  - Status tracking
```

**Our Usage:**
- Create single payments for all boost types
- Support both single talent and bulk talent boosts
- Pass boost data in `metadata` field
- Handle customer creation if needed

---

### 2. **POST /pixQrCode/create** - Direct PIX QR Code

**Purpose:** Create PIX QR codes directly (alternative to billing)

**Key Features:**
```yaml
Request:
  - amount: number (in centavos)
  - externalId: string (optional)
  - metadata: Object (additionalProperties: true) ✅
  
Response:
  - QRCode with brCode and brCodeBase64
  - Status and expiration
```

**Our Usage:**
- Alternative for simple PIX-only payments
- Not primary but available if needed

---

### 3. **GET /pixQrCode/check** - Check Payment Status

**Purpose:** Poll payment status (useful for real-time updates)

**Key Features:**
```yaml
Request:
  - id: QRCode ID (query param)
  
Response:
  - status: PENDING | EXPIRED | CANCELLED | PAID | REFUNDED
  - expiresAt: timestamp
```

**Our Usage:**
- Verify payment completion
- Frontend can poll before webhook arrives

---

### 4. **POST /pixQrCode/simulate-payment** - Sandbox Testing

**Purpose:** Simulate payment in development environment

**Key Features:**
```yaml
Request:
  - id: QRCode ID (query param)
  - metadata: Optional metadata
  
Response:
  - Updated QRCode with PAID status
```

**Our Usage:**
- Test bulk boost payment flows
- Verify webhook handling
- Sandbox integration testing

---

## Compatibility Analysis

### ✅ Metadata Support

**Status:** FULLY COMPATIBLE

The API accepts flexible metadata objects:
```yaml
metadata:
  type: object
  additionalProperties: true  # ✅ Accepts any key-value pairs
```

**What We Store:**
```json
{
  "boost_type": "TALENT_BULK",
  "talent_count": 3,
  "talent_ids": ["uuid1", "uuid2", "uuid3"],
  "discount_percentage": 10,
  "original_amount": 26700,
  "discounted_amount": 24030,
  "establishment_id": "optional_uuid"
}
```

**Use Cases:**
1. Track boost type for webhook processing
2. Store talent IDs for bulk boost creation
3. Record discount details for analytics
4. Link payment to specific boost transaction
5. Future: A/B testing, campaign tracking

---

### ✅ Multiple Products in Single Payment

**Status:** FULLY COMPATIBLE

The API supports `products` array:
```yaml
products:
  type: array
  minItems: 1
  items:
    - externalId: string (unique product identifier)
    - name: string
    - description: string
    - quantity: integer (≥1)
    - price: integer (in centavos, min 100)
```

**Perfect for Bulk Talent Boosts:**

Example: 3 talents × Premium (15 days)
```json
{
  "products": [
    {
      "externalId": "talent_uuid_1",
      "name": "Premium Talent Boost",
      "description": "15-day boost for Talent: Alice",
      "quantity": 1,
      "price": 8900  // R$ 89 - already discounted
    },
    {
      "externalId": "talent_uuid_2",
      "name": "Premium Talent Boost",
      "description": "15-day boost for Talent: Bob",
      "quantity": 1,
      "price": 8900
    },
    {
      "externalId": "talent_uuid_3",
      "name": "Premium Talent Boost",
      "description": "15-day boost for Talent: Carol",
      "quantity": 1,
      "price": 8900
    }
  ]
}
```

**Total Charged:** 26,700 centavos = R$ 267.00 (with 10% discount already applied)

---

### ✅ Discount Implementation via Product Pricing

**Status:** FULLY COMPATIBLE

We apply discounts directly in the `price` field:

**Strategy:**
1. Frontend calculates discounted price per talent
2. Backend creates products with discounted price
3. API charges the discounted amount
4. Metadata tracks original and discounted amounts

**Price Calculation Logic:**
```
Base price per talent: R$ 89 (Premium, 15 days)
Quantity: 3 talents
Volume discount: 10%

Unit price after discount: R$ 89 × 0.90 = R$ 80.10
Total for 3 talents: R$ 80.10 × 3 = R$ 240.30
```

**API Request:**
```json
{
  "products": [
    { "price": 8010 },  // R$ 80.10
    { "price": 8010 },
    { "price": 8010 }
  ],
  "metadata": {
    "original_amount": 26700,  // Before discount
    "discounted_amount": 24030,  // After discount
    "discount_percentage": 10
  }
}
```

**Benefits:**
- Customer sees exact amount before checkout
- No hidden fees
- Webhook receives correct final amount
- Transparent pricing

---

### ✅ Customer Management

**Status:** FULLY COMPATIBLE

Two implementation options:

#### Option A: Existing Customer
```json
{
  "customerId": "cust_abcdefghij"
}
```

#### Option B: Create Inline
```json
{
  "customer": {
    "name": "John Doe",
    "cellphone": "(11) 9999-9999",
    "email": "john@example.com",
    "taxId": "123.456.789-01"
  }
}
```

**Our Implementation:**
1. Check if user has `abacatepay_customer_id` in database
2. If exists: use `customerId`
3. If not: create inline with user data
4. Store returned `customerId` in database
5. Reuse for future payments

---

### ✅ Payment Methods

**Status:** FULLY COMPATIBLE

```yaml
methods:
  - PIX     # Primary - instant, no fees
  - CARD    # Beta - credit card option
```

**Our Strategy:**
```json
{
  "methods": ["PIX", "CARD"]  // Offer both to users
}
```

**Default:** PIX (faster, lower cost)  
**Fallback:** CARD (if PIX not available)

---

### ⚠️ Webhook/Callback Support

**Status:** Not detailed in YAML (but required)

**What YAML Shows:**
```yaml
returnUrl:     # Redirect when "back" clicked
completionUrl: # Redirect when payment completes
```

**What's Missing from YAML:**
```
- Webhook endpoint specifications
- Server-to-server callbacks
- Event types and payloads
```

**ACTION REQUIRED:**
1. Verify webhook implementation in current codebase
2. Confirm single webhook handles multiple boost creation
3. Ensure webhook iterates over `metadata.talent_ids`
4. Create individual boost records per talent

---

## Payment Flow - Bulk Talent Example

### Scenario
User (Establishment) selects 3 talents for Premium boost (15 days)

### Step 1: Frontend Calculation
```javascript
// Frontend calculates price with discount
const talentCount = 3;
const pricePerTalent = 8900;  // R$ 89
const discount = 0.10;  // 10% for 2-3 talents

const basePrice = talentCount * pricePerTalent;  // 26700
const discountAmount = Math.round(basePrice * discount);  // 2670
const finalPrice = basePrice - discountAmount;  // 24030

// Display to user:
// 3 talents × R$ 89 = R$ 267.00
// Discount (10%): -R$ 26.70
// Total: R$ 240.30 ✨
```

### Step 2: Send to Backend
```json
POST /boosts/create
{
  "boostType": "TALENT_BULK",
  "tier": "premium",
  "talentIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### Step 3: Backend Creates Billing
```json
POST /billing/create (Abacate Pay)
{
  "frequency": "ONE_TIME",
  "methods": ["PIX"],
  "products": [
    {
      "externalId": "uuid-1",
      "name": "Premium Talent Boost",
      "description": "15-day boost for [Talent Name 1]",
      "quantity": 1,
      "price": 8010  // R$ 80.10 (discounted)
    },
    {
      "externalId": "uuid-2",
      "name": "Premium Talent Boost",
      "description": "15-day boost for [Talent Name 2]",
      "quantity": 1,
      "price": 8010
    },
    {
      "externalId": "uuid-3",
      "name": "Premium Talent Boost",
      "description": "15-day boost for [Talent Name 3]",
      "quantity": 1,
      "price": 8010
    }
  ],
  "metadata": {
    "boost_type": "TALENT_BULK",
    "talent_count": 3,
    "talent_ids": ["uuid-1", "uuid-2", "uuid-3"],
    "discount_percentage": 10,
    "original_amount": 26700,
    "discounted_amount": 24030
  },
  "customerId": "cust_xxx",  // or customer object
  "returnUrl": "https://velvet.com/boosts",
  "completionUrl": "https://velvet.com/boosts/success",
  "allowCoupons": true,  // Optional: allow user coupons
  "externalId": "boost_bulk_xxx"  // For tracking
}
```

### Step 4: API Returns Payment Link
```json
{
  "data": {
    "id": "billing_xxx",
    "status": "PENDING",
    "url": "https://abacatepay.com/pay/billing_xxx",
    "qrCode": {
      "brCode": "...",
      "brCodeBase64": "data:image/png;base64,..."
    }
  }
}
```

### Step 5: User Completes Payment
- Redirected to AbacatePay checkout
- Scans QR code or enters card details
- Pays R$ 240.30 (after discount)
- Payment confirmed

### Step 6: Webhook Notification
```json
POST /webhooks/payment (Your API)
{
  "event": "payment.completed",
  "data": {
    "billing_id": "billing_xxx",
    "amount": 24030,  // Final amount
    "status": "COMPLETED",
    "metadata": {
      "boost_type": "TALENT_BULK",
      "talent_count": 3,
      "talent_ids": ["uuid-1", "uuid-2", "uuid-3"],
      "discount_percentage": 10,
      "original_amount": 26700,
      "discounted_amount": 24030
    }
  }
}
```

### Step 7: Backend Processing
```javascript
// Webhook handler
if (metadata.boost_type === 'TALENT_BULK') {
  for (const talentId of metadata.talent_ids) {
    // Create individual boost record
    await createBoost({
      boostType: 'TALENT_BULK',
      talentId: talentId,
      tier: 'premium',
      duration: 15,
      paymentId: billing_id,
      status: 'ACTIVE',
      startAt: now,
      endAt: now + 15 days
    });
  }
  // Update payment record
  await updatePayment(billing_id, {
    status: 'COMPLETED',
    metadata: metadata
  });
}
```

### Step 8: Success
✅ All 3 talents now have active Premium boosts for 15 days!

---

## Implementation Details

### Discount Application Strategy

**Why: Apply discount to product prices**

Benefits:
1. **Transparent Pricing:** Customer sees exact amount before checkout
2. **Consistent:** Metadata documents the discount
3. **Simple:** No additional coupon complexity
4. **Auditable:** Clear record of original vs discounted amounts

**How:**
```
Base price: R$ 89
Discount %: 10%
Discounted price: R$ 89 × 0.90 = R$ 80.10

In API request: price: 8010 (in centavos)
```

**Alternative Considered:**
- Use `/coupon/create` endpoint
- Not recommended (adds complexity)
- Stick with product pricing strategy

---

### Product ExternalId Usage

**Purpose:** Track products back to talents

**Strategy:**
```json
{
  "externalId": "talent_uuid_here"
}
```

**Why:**
- API creates product automatically
- Reusable product IDs in AbacatePay
- Easy to track which talent is which
- Simple webhook processing

**Alternative:**
```json
{
  "externalId": "talent_boost_uuid_xxx"
}
```

Either works, but direct UUID is cleaner.

---

### Single Payment for Multiple Boosts

**Key Architecture Decision:**

One Abacate Pay billing → Multiple boost records

**How It Works:**
```
1. User pays once (R$ 240.30)
2. Webhook receives payment.completed event
3. Metadata contains all talent IDs
4. Loop through talent_ids
5. Create individual boost for each talent
6. All linked to same payment_id
7. All created in same transaction
```

**Database:**
```sql
-- Table: payments
id: UUID
billing_id: VARCHAR (from AbacatePay)
amount_cents: BIGINT (final amount: 24030)
status: ENUM (COMPLETED)
metadata: JSONB {boost_type, talent_ids, discount_percentage, ...}
created_at: TIMESTAMP

-- Table: boosts
id: UUID
boost_type: ENUM (TALENT_BULK)
talent_id: UUID
establishment_id: UUID (null for TALENT_BULK)
talent_ids: JSONB (null for single boosts)
payment_id: UUID (links to payments table)
status: ENUM (ACTIVE)
start_at: TIMESTAMP
end_at: TIMESTAMP
```

**Advantages:**
- Single transaction for payment + all boosts
- Atomic operation (all-or-nothing)
- Easy to refund (one payment = refund all)
- Metadata contains full context

---

## Testing Strategy

### Unit Testing (Backend)
```typescript
// Test pricing calculation with discount
const talentCount = 3;
const discount = getPriceDiscount(talentCount);  // 0.10
const price = 8900;
const discountedPrice = Math.floor(price * (1 - discount));
expect(discountedPrice).toBe(8010);  // ✓

// Test bulk boost creation
const payment = {
  id: 'pay_xxx',
  amount_cents: 24030,
  metadata: {
    boost_type: 'TALENT_BULK',
    talent_ids: ['id1', 'id2', 'id3']
  }
};
const boosts = await createBoostsFromPayment(payment);
expect(boosts).toHaveLength(3);  // ✓
expect(boosts[0].payment_id).toBe('pay_xxx');  // ✓
```

### Integration Testing (Sandbox)
```javascript
// 1. Create bulk boost request
const boost = {
  boostType: 'TALENT_BULK',
  tier: 'premium',
  talentIds: ['talent_1', 'talent_2']
};

// 2. Create billing via API
const billing = await createBilling({
  products: [...],
  metadata: { boost_type: 'TALENT_BULK', ... }
});

// 3. Simulate payment
await simulatePayment(billing.id);

// 4. Verify boosts created
const createdBoosts = await getBoosts({ payment_id: billing.id });
expect(createdBoosts).toHaveLength(2);  // ✓
```

### E2E Testing (Sandbox)
```javascript
// Full flow: Select talents → Payment → Boosts activated
describe('Bulk Talent Boost Flow', () => {
  it('should create 3 boosts for bulk purchase', async () => {
    // 1. Establishment selects 3 talents
    const talentIds = ['alice', 'bob', 'carol'];
    
    // 2. Create payment
    const payment = await createBoost({
      boostType: 'TALENT_BULK',
      talentIds,
      tier: 'premium'
    });
    
    // 3. Verify billing created
    expect(payment.billing_id).toBeDefined();
    
    // 4. Simulate payment
    await simulatePayment(payment.billing_id);
    
    // 5. Verify 3 boosts active
    for (const id of talentIds) {
      const boost = await getActiveBoost(id);
      expect(boost.status).toBe('ACTIVE');
      expect(boost.payment_id).toBe(payment.billing_id);
    }
  });
});
```

### Manual Testing Checklist

- [ ] Single TALENT boost (unchanged flow)
- [ ] ESTABLISHMENT_PROFILE boost (new flow)
- [ ] TALENT_BULK with 1 talent (no discount)
- [ ] TALENT_BULK with 2 talents (10% discount)
- [ ] TALENT_BULK with 3 talents (10% discount)
- [ ] TALENT_BULK with 4 talents (20% discount)
- [ ] TALENT_BULK with 6 talents (30% discount)
- [ ] Sandbox payment simulation
- [ ] Webhook payment confirmation
- [ ] Multiple boosts from single payment
- [ ] Discount calculation accuracy
- [ ] Database integrity (all boosts linked to payment)

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review current webhook implementation
- [ ] Verify webhook handles metadata
- [ ] Document AbacatePay API keys
- [ ] Set up sandbox testing account
- [ ] Test webhook in sandbox environment

### Phase 2-4 Integration Points
- [ ] Update `/billing/create` call with new metadata
- [ ] Implement metadata parsing in webhook
- [ ] Create bulk boost handling in webhook
- [ ] Add tests for bulk operations
- [ ] Verify payment linking to multiple boosts

### Deployment
- [ ] Test all boost types in staging
- [ ] Verify webhook callbacks work
- [ ] Test refund process (if multi-boost)
- [ ] Performance test: 10 talents in one boost
- [ ] Monitor webhook processing time

---

## Migration Notes for Existing Payments

All existing payments can be migrated with default values:

```javascript
// Add metadata to existing payments
migration.up = async () => {
  await Payment.update(
    { metadata: null },
    {
      metadata: {
        boost_type: 'TALENT',  // Default for existing
        talent_id: Sequelize.col('boost.talent_id'),
        discount_percentage: 0
      }
    }
  );
};
```

This ensures backward compatibility.

---

## Risk Assessment

### Low Risk Areas ✅
- Metadata flexibility
- Product array support
- Customer creation

### Medium Risk Areas ⚠️
- Webhook reliability (depends on current implementation)
- Multiple product creation in single billing
- Discount accuracy across systems

### Mitigation Strategies
1. **Webhook:** Implement retry logic, exponential backoff
2. **Products:** Test with sandbox before production
3. **Discount:** Unit tests for all tier combinations
4. **Atomicity:** Use database transactions for bulk boost creation

---

## Performance Considerations

### API Calls
```
Single TALENT boost:
├─ POST /billing/create: 1 call
└─ Webhook: 1 call
Total: 2 API calls

Bulk TALENT boost (3 talents):
├─ POST /billing/create: 1 call (with 3 products)
└─ Webhook: 1 call
Total: 2 API calls ✓ (same as single!)
```

### Database Impact
```
Single boost:
├─ INSERT boosts: 1
└─ INSERT payments: 1

Bulk boost (3 talents):
├─ INSERT boosts: 3
└─ INSERT payments: 1 (linked to all 3)
Total: ~3x database operations
```

This is acceptable since bulk operations are less frequent.

---

## Future Enhancements

1. **Coupon Support:** Use `/coupon/create` for campaigns
2. **Subscription Boosts:** Use MULTIPLE_PAYMENTS frequency
3. **Analytics:** Store metadata for boost performance tracking
4. **Refunds:** Implement refund logic via AbacatePay
5. **Internationalization:** Support multiple payment currencies

---

## Conclusion

✅ **Green Light to Proceed**

The Abacate Pay API provides everything needed for the dual-pricing boost system:
- Flexible metadata ✓
- Bulk product support ✓
- Discounted pricing ✓
- Customer management ✓
- Multiple payment methods ✓
- Webhook integration ✓

No architectural blockers identified.

**Ready to implement Phase 1!**

---

**Document Last Updated:** 2026-01-03 18:10 UTC  
**Review Status:** Approved for implementation
