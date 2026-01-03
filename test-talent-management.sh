#!/bin/bash

# Establishment-Talent Integration Test Script
# Tests the new endpoints for talent management

API_URL="${API_URL:-http://localhost:4000/api/v1}"
TOKEN="${TOKEN}"

echo "================================"
echo "Establishment-Talent Integration Tests"
echo "================================"
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ Please set TOKEN environment variable"
    echo "Example: export TOKEN='your_jwt_token'"
    exit 1
fi

echo "Using API URL: $API_URL"
echo ""

# Test 1: Get Managed Talents
echo "📋 Test 1: Get Managed Talents"
echo "GET /invitations/managed-talents"
echo "---"
curl -s -X GET "$API_URL/invitations/managed-talents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 2: Purchase Boost for Talents (will fail without valid talent IDs)
echo "📋 Test 2: Purchase Boost for Talents (Example)"
echo "POST /boosts/purchase-for-talents"
echo "---"
echo "Example payload:"
cat << 'EOF' | jq '.'
{
  "talentIds": ["talent-uuid-1", "talent-uuid-2"],
  "boostType": "basic_7d"
}
EOF
echo ""
echo "To test, run:"
echo "curl -X POST \"$API_URL/boosts/purchase-for-talents\" \\"
echo "  -H \"Authorization: Bearer \$TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"talentIds\": [\"uuid1\", \"uuid2\"], \"boostType\": \"basic_7d\"}'"
echo ""

echo "================================"
echo "✅ Test script complete"
echo "================================"
