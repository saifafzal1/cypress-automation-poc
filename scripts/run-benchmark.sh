#!/bin/sh
# Benchmark runner script — installs missing dependencies if needed, then runs Cypress

# Fix for Cypress 11.x: broken bundled @babel/runtime
# Install it into Cypress's own node_modules where babel-loader looks for it
CYPRESS_VERSION=$(npx cypress version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
CYPRESS_APP="/root/.cache/Cypress/${CYPRESS_VERSION}/Cypress/resources/app"
if [ -d "${CYPRESS_APP}/node_modules/@babel" ] && [ ! -d "${CYPRESS_APP}/node_modules/@babel/runtime" ]; then
    echo "Installing @babel/runtime into Cypress ${CYPRESS_VERSION} bundled modules..."
    cd "${CYPRESS_APP}" && npm install --no-save @babel/runtime 2>/dev/null || true
    cd /app
fi

# Run Cypress
npx cypress run --spec 'cypress/e2e/smoke/**'
