#!/bin/bash

set -e

BASE_URL="http://localhost:8081"
USER_ID="user123"
FILE_CONTENT="Hello World Test Content"

echo "=== Testing CCAI Collections File Flow ==="

# 1. Health Check
echo "1. Checking service health..."
curl -s "$BASE_URL/actuator/health" | jq '.'

# 2. Generate Upload URL
echo -e "\n2. Generating upload URL..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/files/upload-url" \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"test.txt\",\"contentType\":\"text/plain\",\"userId\":\"$USER_ID\"}")

echo "$UPLOAD_RESPONSE" | jq '.'

# Extract upload URL and file key
UPLOAD_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.uploadUrl')
FILE_KEY=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.fileKey')

if [ "$UPLOAD_URL" = "null" ]; then
    echo "Failed to get upload URL"
    exit 1
fi

# 3. Upload File
echo -e "\n3. Uploading file..."
UPLOAD_RESULT=$(curl -s -X PUT "$UPLOAD_URL" \
  -H "Content-Type: text/plain" \
  -d "$FILE_CONTENT")

if [ -n "$UPLOAD_RESULT" ]; then
    echo "Upload response: $UPLOAD_RESULT"
else
    echo "File uploaded successfully!"
fi

# 3.1. Update File Metadata
echo -e "\n3.1. Updating file metadata..."
curl -s -X POST "$BASE_URL/api/v1/files/metadata?fileKey=$FILE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.txt"}' | jq '.'

# 4. List User Files
echo -e "\n4. Listing user files..."
curl -s "$BASE_URL/api/v1/files?userId=$USER_ID" | jq '.'

# 5. Generate Download URL
echo -e "\n5. Generating download URL..."
curl -s -X POST "$BASE_URL/api/v1/files/download-url" \
  -H "Content-Type: application/json" \
  -d "{\"fileKey\":\"$FILE_KEY\",\"userId\":\"$USER_ID\"}" | jq '.'

# 6. Get File Metadata
echo -e "\n6. Getting file metadata..."
curl -s "$BASE_URL/api/v1/files/metadata?fileKey=$FILE_KEY" | jq '.'

echo -e "\n=== Test Complete ==="