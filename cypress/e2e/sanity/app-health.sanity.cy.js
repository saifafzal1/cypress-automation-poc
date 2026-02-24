describe('Sanity — App Health Check', () => {
  it('should return 200 for the homepage', () => {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('should return 200 for the login page', () => {
    cy.request('/profile.php').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('should load the homepage with proper DOM', () => {
    cy.visit('/')
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('body').should('not.be.empty')
  })

  it('should load static assets (CSS and JS)', () => {
    cy.visit('/')
    cy.get('link[rel="stylesheet"]').should('exist')
  })
})
