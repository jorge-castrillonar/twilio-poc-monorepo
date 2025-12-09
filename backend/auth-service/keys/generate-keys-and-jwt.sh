#!/bin/bash

# Script to generate RSA key pair and JWT token for S3Handler Enterprise
# This script generates:
# 1. Private key (PEM format)
# 2. Public key (PEM format)
# 3. Public key in base64 format (for .env file)
# 4. A valid JWT token signed with the private key

set -e

echo "==================================="
echo "RSA Key Generation & JWT Creator"
echo "==================================="
echo ""

# Create keys directory if it doesn't exist
mkdir -p keys

# Generate private key (4096 bits for security)
echo "[1/5] Generating RSA private key..."
openssl genrsa -out keys/private_key.pem 4096

# Extract public key
echo "[2/5] Extracting public key..."
openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem

# Convert public key to single-line base64 (for .env file)
echo "[3/5] Converting public key to base64 format..."
PUBLIC_KEY_BASE64=$(openssl rsa -in keys/private_key.pem -pubout -outform DER | base64 -w 0)
echo "$PUBLIC_KEY_BASE64" > keys/public_key_base64.txt

echo ""
echo "✓ Keys generated successfully!"
echo "  - Private key: keys/private_key.pem"
echo "  - Public key: keys/public_key.pem"
echo "  - Public key (base64): keys/public_key_base64.txt"
echo ""

# Display the base64 public key for .env file
echo "==================================="
echo "Add this to your .env file:"
echo "==================================="
echo "JWT_PUBLIC_KEY=$PUBLIC_KEY_BASE64"
echo ""

# Generate JWT token
echo "[4/5] Generating JWT token..."

# JWT Header
HEADER='{"alg":"RS256","typ":"JWT"}'
HEADER_B64=$(echo -n "$HEADER" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

# JWT Payload
CURRENT_TIME=$(date +%s)
EXPIRATION_TIME=$((CURRENT_TIME + 3600)) # 1 hour from now

PAYLOAD=$(cat <<EOF
{
  "sub": "test-user",
  "iss": "s3handler-enterprise",
  "iat": $CURRENT_TIME,
  "exp": $EXPIRATION_TIME,
  "userId": "123",
  "username": "testuser",
  "email": "test@example.com",
  "roles": ["USER", "ADMIN"]
}
EOF
)

PAYLOAD_B64=$(echo -n "$PAYLOAD" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

# Create signature
SIGNATURE=$(echo -n "${HEADER_B64}.${PAYLOAD_B64}" | \
    openssl dgst -sha256 -sign keys/private_key.pem | \
    base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n')

# Combine all parts
JWT="${HEADER_B64}.${PAYLOAD_B64}.${SIGNATURE}"

echo "[5/5] JWT token generated!"
echo ""

# Save JWT to file
echo "$JWT" > keys/jwt_token.txt

echo "==================================="
echo "JWT Token (valid for 1 hour):"
echo "==================================="
echo "$JWT"
echo ""
echo "Token saved to: keys/jwt_token.txt"
echo ""

echo "==================================="
echo "JWT Payload:"
echo "==================================="
echo "$PAYLOAD" | jq '.' 2>/dev/null || echo "$PAYLOAD"
echo ""

echo "==================================="
echo "Test the token with curl:"
echo "==================================="
echo "curl -H \"Authorization: Bearer $JWT\" \\"
echo "     http://localhost:8080/api/v1/files"
echo ""

echo "✓ Done! All files saved in the 'keys' directory"
