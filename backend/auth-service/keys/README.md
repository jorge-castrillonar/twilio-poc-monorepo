# JWT Keys Directory

This directory contains the script to generate RSA key pairs for JWT token signing.

## ⚠️ Important Security Notes

1. **DO NOT commit** the generated `.pem` files to git (already in `.gitignore`)
2. Each developer must generate their own keys locally
3. In production, keys should be managed by a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
4. Keys are shared between `auth-service` and `s3-service` for token validation

## 🔑 Generating Keys

Run the generation script:

```bash
cd backend/auth-service/keys
./generate-keys-and-jwt.sh
```

This script will generate:
- `private_key.pem` - Private key for signing JWTs (4096-bit RSA)
- `public_key.pem` - Public key for verifying JWTs
- `public_key_base64.txt` - Base64-encoded public key (for `.env` file)
- `jwt_token.txt` - Sample JWT token (valid for 1 hour)

## 📝 Adding Keys to Environment

After generating the keys, add them to your `backend/.env` file:

```bash
# Copy the base64 public key
cat public_key_base64.txt

# Add to backend/.env:
JWT_PUBLIC_KEY=<paste-base64-content-here>

# For JWT_PRIVATE_KEY, encode the private key:
cat private_key.pem | base64 -w 0

# Add to backend/.env:
JWT_PRIVATE_KEY=<paste-base64-content-here>
```

## 🔄 Sharing Keys Between Services

Both `auth-service` and `s3-service` need access to the same keys:

1. **Generate keys once** in either service
2. **Copy** both `.pem` files to the other service's `keys/` directory
3. Both services will use the same keys via Docker volume mounts or env variables

## 🚀 Docker Setup

When running with Docker, the keys are copied during the Docker build process (see `Dockerfile`).

For local development without Docker:
1. Generate keys in `auth-service/keys/`
2. Copy to `s3-service/keys/` if needed
3. Update `backend/.env` with the base64 values

## 🔍 Verifying Keys

Test that keys were generated correctly:

```bash
# Verify private key
openssl rsa -in private_key.pem -check

# Verify public key
openssl rsa -pubin -in public_key.pem -text -noout

# Test JWT token
cat jwt_token.txt
```

## 📚 Key Specifications

- **Algorithm**: RSA
- **Key Size**: 4096 bits
- **Signature Algorithm**: RS256 (RSA with SHA-256)
- **Token Expiration**: Configurable (default: 15 minutes for access tokens)

## 🛠️ Troubleshooting

### Script fails with "command not found"
Ensure OpenSSL is installed:
```bash
sudo apt-get install openssl  # Ubuntu/Debian
brew install openssl          # macOS
```

### Permission denied
Make script executable:
```bash
chmod +x generate-keys-and-jwt.sh
```

### Keys not found in Docker
Ensure the `COPY keys/*.pem` line exists in the `Dockerfile` and keys are generated before building.
