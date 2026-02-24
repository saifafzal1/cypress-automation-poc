#!/bin/sh
# Benchmark runner script — installs missing dependencies if needed, then runs Cypress
# This avoids shell quoting issues with docker create + sh -c

# Install @babel/runtime (needed for Cypress 11.x which has a broken bundled version)
npm install --no-save @babel/runtime 2>/dev/null || true

# Run Cypress
npx cypress run --spec 'cypress/e2e/smoke/**'
