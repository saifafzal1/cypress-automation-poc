#!/bin/sh
# Benchmark runner script — fixes missing dependencies, then runs Cypress

# Increase verification timeout for parallel runs (default 30s is too short
# when multiple containers compete for CPU/memory during Cypress startup)
export CYPRESS_VERIFY_TIMEOUT=120000

# Detect Cypress major version for version-specific handling
CYPRESS_MAJOR=$(npx cypress version 2>/dev/null | head -1 | grep -oE '[0-9]+' | head -1)
echo "Detected Cypress major version: ${CYPRESS_MAJOR}"

# Fix for Cypress 11.x–12.x: broken/incomplete bundled @babel/runtime
# 1. Install @babel/runtime in the project directory
# 2. Copy it into Cypress's bundled node_modules (where babel-loader resolves from)
# This avoids running npm install inside Cypress's dir which destroys its bundles
if [ "${CYPRESS_MAJOR}" -le 12 ] 2>/dev/null; then
    # Ensure package.json exists so npm install works reliably with npm 7+
    [ -f /app/package.json ] || echo '{"name":"cypress-benchmark","version":"1.0.0","private":true}' > /app/package.json
    npm install --no-save @babel/runtime 2>/dev/null || true

    CYPRESS_VERSION=$(npx cypress version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [ -n "${CYPRESS_VERSION}" ] && [ -d "/app/node_modules/@babel/runtime" ]; then
        CYPRESS_BABEL="/root/.cache/Cypress/${CYPRESS_VERSION}/Cypress/resources/app/node_modules/@babel/runtime"
        echo "Patching @babel/runtime in Cypress ${CYPRESS_VERSION}..."
        rm -rf "${CYPRESS_BABEL}" 2>/dev/null || true
        cp -r /app/node_modules/@babel/runtime "${CYPRESS_BABEL}" 2>/dev/null || true
    fi
fi

# Run Cypress — use explicit .cy.js extension so Cypress 13+ strict spec matching works
# (Cypress 13+ requires --spec to match the specPattern; bare '**' glob finds 0 specs)
npx cypress run --spec 'cypress/e2e/**/*.cy.js'
