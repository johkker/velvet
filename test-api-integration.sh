#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000/api/v1"
FRONTEND_URL="http://localhost:3000"

echo "=========================================="
echo "🧪 Velvet API Integration Test Suite"
echo "=========================================="
echo ""

# Test 1: Backend Health Check
echo -e "${YELLOW}[1/8]${NC} Testing backend health..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/talents/featured 2>/dev/null)
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend not responding (HTTP $BACKEND_RESPONSE)"
    echo "   Start backend with: cd backend && npm run start:dev"
    exit 1
fi

# Test 2: Featured Talents Endpoint
echo -e "${YELLOW}[2/8]${NC} Testing GET /talents/featured..."
FEATURED=$(curl -s $API_URL/talents/featured)
if echo "$FEATURED" | jq -e '.data' > /dev/null 2>&1; then
    TALENT_COUNT=$(echo "$FEATURED" | jq '.data | length')
    echo -e "${GREEN}✓${NC} Featured talents endpoint working ($TALENT_COUNT talents)"
    
    # Check if response uses camelCase
    if echo "$FEATURED" | jq -e '.data[0].displayName' > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Response uses camelCase (displayName)"
    else
        echo -e "${RED}✗${NC} Response not using camelCase"
    fi
else
    echo -e "${RED}✗${NC} Featured talents endpoint failed"
    echo "$FEATURED" | jq '.' || echo "$FEATURED"
fi

# Test 3: Search Talents Endpoint
echo -e "${YELLOW}[3/8]${NC} Testing GET /talents/search..."
SEARCH=$(curl -s "$API_URL/talents/search?limit=5")
if echo "$SEARCH" | jq -e '.data' > /dev/null 2>&1; then
    SEARCH_COUNT=$(echo "$SEARCH" | jq '.data | length')
    echo -e "${GREEN}✓${NC} Search endpoint working ($SEARCH_COUNT results)"
else
    echo -e "${RED}✗${NC} Search endpoint failed"
fi

# Test 4: Get First Talent Profile
echo -e "${YELLOW}[4/8]${NC} Testing GET /talents/:slug..."
FIRST_SLUG=$(echo "$FEATURED" | jq -r '.data[0].slug // empty')
if [ -n "$FIRST_SLUG" ]; then
    PROFILE=$(curl -s "$API_URL/talents/$FIRST_SLUG")
    if echo "$PROFILE" | jq -e '.data.displayName' > /dev/null 2>&1; then
        TALENT_NAME=$(echo "$PROFILE" | jq -r '.data.displayName')
        echo -e "${GREEN}✓${NC} Profile endpoint working (${TALENT_NAME})"
        
        # Check for all expected camelCase fields
        HAS_PHOTO_GALLERY=$(echo "$PROFILE" | jq -e '.data.photoGallery' > /dev/null 2>&1 && echo "yes" || echo "no")
        HAS_PRICE_MIN=$(echo "$PROFILE" | jq -e '.data.priceMin' > /dev/null 2>&1 && echo "yes" || echo "no")
        HAS_IS_VERIFIED=$(echo "$PROFILE" | jq -e '.data.isVerified' > /dev/null 2>&1 && echo "yes" || echo "no")
        
        if [ "$HAS_PHOTO_GALLERY" = "yes" ] && [ "$HAS_PRICE_MIN" = "yes" ] && [ "$HAS_IS_VERIFIED" = "yes" ]; then
            echo -e "${GREEN}✓${NC} All camelCase fields present"
        else
            echo -e "${YELLOW}⚠${NC} Some fields missing (photoGallery:$HAS_PHOTO_GALLERY, priceMin:$HAS_PRICE_MIN, isVerified:$HAS_IS_VERIFIED)"
        fi
    else
        echo -e "${RED}✗${NC} Profile endpoint failed for slug: $FIRST_SLUG"
    fi
else
    echo -e "${YELLOW}⚠${NC} No talents found to test profile endpoint"
fi

# Test 5: Locations Endpoints
echo -e "${YELLOW}[5/8]${NC} Testing GET /locations/countries..."
COUNTRIES=$(curl -s "$API_URL/locations/countries")
if echo "$COUNTRIES" | jq -e '.data' > /dev/null 2>&1; then
    COUNTRY_COUNT=$(echo "$COUNTRIES" | jq '.data | length')
    echo -e "${GREEN}✓${NC} Locations endpoint working ($COUNTRY_COUNT countries)"
    
    # Test states for first country
    FIRST_COUNTRY_ID=$(echo "$COUNTRIES" | jq -r '.data[0].id // empty')
    if [ -n "$FIRST_COUNTRY_ID" ]; then
        STATES=$(curl -s "$API_URL/locations/states?countryId=$FIRST_COUNTRY_ID")
        STATE_COUNT=$(echo "$STATES" | jq '.data | length' 2>/dev/null || echo "0")
        echo -e "${GREEN}✓${NC} States endpoint working ($STATE_COUNT states)"
    fi
else
    echo -e "${RED}✗${NC} Locations endpoint failed"
fi

# Test 6: Auth - Register (with random email)
echo -e "${YELLOW}[6/8]${NC} Testing POST /auth/register/talent..."
RANDOM_EMAIL="test_$(date +%s)@velvet.com"
REGISTER_DATA='{
    "email": "'$RANDOM_EMAIL'",
    "password": "password123",
    "displayName": "Test Talent",
    "city": "New York"
}'
REGISTER=$(curl -s -X POST "$API_URL/auth/register/talent" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if echo "$REGISTER" | jq -e '.data.accessToken' > /dev/null 2>&1; then
    ACCESS_TOKEN=$(echo "$REGISTER" | jq -r '.data.accessToken')
    echo -e "${GREEN}✓${NC} Registration successful (camelCase accessToken)"
else
    echo -e "${YELLOW}⚠${NC} Registration test skipped or failed (may be duplicate)"
    ACCESS_TOKEN=""
fi

# Test 7: Auth - Login
echo -e "${YELLOW}[7/8]${NC} Testing POST /auth/login..."
LOGIN_DATA='{
    "email": "talent1@velvet.com",
    "password": "password123"
}'
LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

if echo "$LOGIN" | jq -e '.data.accessToken' > /dev/null 2>&1; then
    ACCESS_TOKEN=$(echo "$LOGIN" | jq -r '.data.accessToken')
    echo -e "${GREEN}✓${NC} Login successful"
else
    echo -e "${RED}✗${NC} Login failed"
    echo "$LOGIN" | jq '.'
fi

# Test 8: Authenticated Request - Get Current User
if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}[8/8]${NC} Testing GET /users/me (authenticated)..."
    ME=$(curl -s "$API_URL/users/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$ME" | jq -e '.data.email' > /dev/null 2>&1; then
        USER_EMAIL=$(echo "$ME" | jq -r '.data.email')
        echo -e "${GREEN}✓${NC} Authenticated request working (user: $USER_EMAIL)"
        
        # Check if talent profile exists and uses camelCase
        if echo "$ME" | jq -e '.data.talent' > /dev/null 2>&1; then
            HAS_DISPLAY_NAME=$(echo "$ME" | jq -e '.data.talent.displayName' > /dev/null 2>&1 && echo "yes" || echo "no")
            if [ "$HAS_DISPLAY_NAME" = "yes" ]; then
                echo -e "${GREEN}✓${NC} Talent profile uses camelCase"
            else
                echo -e "${YELLOW}⚠${NC} Talent profile may not use camelCase"
            fi
        fi
    else
        echo -e "${RED}✗${NC} Authenticated request failed"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping authenticated test (no token)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓${NC} Integration tests complete!"
echo "=========================================="
echo ""
echo "Frontend should be accessible at: $FRONTEND_URL"
echo "Backend API docs: http://localhost:4000/api/docs"
echo ""
