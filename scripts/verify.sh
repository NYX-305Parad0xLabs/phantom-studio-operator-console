#!/usr/bin/env sh
set -euo pipefail

echo "Running lint"
npm run lint

echo "Running typecheck"
npm run typecheck

echo "Running tests"
npm run test

echo "Running build"
npm run build
