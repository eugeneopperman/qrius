#!/bin/bash

# Generate secure random strings for environment variables
# Usage: ./scripts/generate-secrets.sh

echo "==================================="
echo "Qrius Production Secrets Generator"
echo "==================================="
echo ""
echo "Copy these values to your .env.local or Vercel environment variables:"
echo ""

# Generate IP_SALT (for privacy-preserving IP hashing)
echo "IP_SALT=$(openssl rand -hex 32)"

# Generate API_KEY_SECRET (for API key encryption)
echo "API_KEY_SECRET=$(openssl rand -hex 32)"

echo ""
echo "==================================="
echo "Keep these values secret!"
echo "==================================="
