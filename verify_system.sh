#!/bin/bash

BASE_URL="http://127.0.0.1:8000/api"
COOKIE_FILE="cookies.txt"

# 1. Get CSRF Token
echo "1. Fetching CSRF Token..."
curl -c $COOKIE_FILE -s "$BASE_URL/auth/csrf/" > /dev/null
CSRF_TOKEN=$(grep csrftoken $COOKIE_FILE | awk '{print $7}')
echo "CSRF Token: $CSRF_TOKEN"

# 2. Login as Admin
echo -e "\n2. Logging in as Admin..."
curl -s -X POST "$BASE_URL/auth/login/" \
  -b $COOKIE_FILE -c $COOKIE_FILE \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' > login_response.json
cat login_response.json
echo ""

# 3. Verify Departments
echo -e "\n3. Fetching Departments..."
curl -s -X GET "$BASE_URL/academic/departments/" \
  -b $COOKIE_FILE \
  -H "Content-Type: application/json" > departments.json
cat departments.json
echo ""

# 4. Verify Years
echo -e "\n4. Fetching Years..."
curl -s -X GET "$BASE_URL/academic/years/" \
  -b $COOKIE_FILE \
  -H "Content-Type: application/json" > years.json
cat years.json
echo ""

# 5. Verify Levels (Filtered)
# Assuming we have at least one dept and year from previous steps
DEPT_ID=$(jq '.[0].id' departments.json)
YEAR_ID=$(jq '.[0].id' years.json)

if [ "$DEPT_ID" != "null" ] && [ "$YEAR_ID" != "null" ]; then
    echo -e "\n5. Fetching Levels for Dept $DEPT_ID and Year $YEAR_ID..."
    curl -s -X GET "$BASE_URL/academic/levels/?department=$DEPT_ID&academic_year=$YEAR_ID" \
      -b $COOKIE_FILE \
      -H "Content-Type: application/json"
else
    echo -e "\nSkipping Level verification (No Dept/Year found)"
fi
echo ""
