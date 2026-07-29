#!/bin/bash
# Generate self-signed SSL certificates for development
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$SCRIPT_DIR/server.key" \
  -out "$SCRIPT_DIR/server.crt" \
  -subj "/C=MX/ST=Jalisco/L=Guadalajara/O=SIFUT/OU=Dev/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "SSL certificates generated in $SCRIPT_DIR"
