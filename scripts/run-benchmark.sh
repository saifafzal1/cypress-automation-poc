#!/bin/sh
# Benchmark runner script — fixes missing dependencies, then runs Cypress

# Fix for Cypress 11.x: broken/incomplete bundled @babel/runtime
# 1. Install @babel/runtime in the project directory
# 2. Copy it into Cypress's bundled node_modules (where babel-loader resolves from)
# This avoids running npm install inside Cypress's dir which destroys its bundles
npm install --no-save @babel/runtime 2>/dev/null || true

CYPRESS_VERSION=$(npx cypress version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [ -n "${CYPRESS_VERSION}" ] && [ -d "/app/node_modules/@babel/runtime" ]; then
    CYPRESS_BABEL="/root/.cache/Cypress/${CYPRESS_VERSION}/Cypress/resources/app/node_modules/@babel/runtime"
    echo "Patching @babel/runtime in Cypress ${CYPRESS_VERSION}..."
    rm -rf "${CYPRESS_BABEL}" 2>/dev/null || true
    cp -r /app/node_modules/@babel/runtime "${CYPRESS_BABEL}" 2>/dev/null || true
fi

# Run Cypress — all tests for full benchmark metrics
npx cypress run --spec 'cypress/e2e/**'
