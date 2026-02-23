// ── Login via UI ──
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('[data-testid="username"]').clear().type(username)
  cy.get('[data-testid="password"]').clear().type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

// ── Login via API (skip UI for speed) ──
Cypress.Commands.add('apiLogin', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { username, password }
  }).then((response) => {
    expect(response.status).to.eq(200)
    window.localStorage.setItem('authToken', response.body.token)
  })
})

// ── Reset application state ──
Cypress.Commands.add('resetState', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/reset',
    failOnStatusCode: false
  })
})

// ── Intercept and wait for API response ──
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias)
})
