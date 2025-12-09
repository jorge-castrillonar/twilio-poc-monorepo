#!/bin/bash

# Test download using the URL from the previous test
DOWNLOAD_URL="https://ccai-collections-file-repository-dev.s3.amazonaws.com/uploads/03c39fa5-184b-424d-9df2-f04e11da84e9.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20251112T041011Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=AKIA4XI2MJ5LHHI2C7OR%2F20251112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b6528c467c7f62c220d6d997757c1ea23e9aaa6c8c8ee92b4d121a290594568d"

echo "=== Testing File Download ==="
echo "Downloading file content..."
curl -s "$DOWNLOAD_URL"
echo -e "\n=== Download Complete ==="