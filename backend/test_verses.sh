#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Daily Bible API - Verse Endpoints Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080"

# Test 1: Daily Verse
echo -e "${YELLOW}Test 1: GET /api/verses/daily${NC}"
echo "Testing daily verse endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/verses/daily")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_CODE"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Get Verse by Reference
echo -e "${YELLOW}Test 2: GET /api/verses/:reference${NC}"
echo "Testing verse lookup (John 3:16)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/verses/John%203:16")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_CODE"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Search Verses
echo -e "${YELLOW}Test 3: GET /api/verses/search?q=love&limit=3${NC}"
echo "Testing verse search..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/verses/search?q=love&limit=3")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_CODE"
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 4: Invalid Reference (Error Handling)
echo -e "${YELLOW}Test 4: GET /api/verses/InvalidBook%201:1 (Error Handling)${NC}"
echo "Testing error handling with invalid reference..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/verses/InvalidBook%201:1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 400 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly returned error status: $HTTP_CODE"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC} - Should return error status, got: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Search with Empty Query (Error Handling)
echo -e "${YELLOW}Test 5: GET /api/verses/search (Empty Query - Error Handling)${NC}"
echo "Testing error handling with empty search query..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/verses/search")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 400 ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly returned error status: $HTTP_CODE"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC} - Should return error status, got: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "All verse endpoints have been tested!"
echo ""
echo "Next steps:"
echo "1. Verify all tests passed"
echo "2. Check that responses contain expected data"
echo "3. Ready to move to Week 4 (Favorites & History)"
