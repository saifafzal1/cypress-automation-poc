const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://katalon-demo-cura.herokuapp.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: { runMode: 0, openMode: 0 },
    video: false,
    screenshotOnRunFailure: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js'
  }
})
