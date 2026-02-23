describe('Sanity: App Health Check', () => {
  it('should return 200 for the homepage', () => {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('should return 200 for the login page', () => {
    cy.request('/login').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('should return 200 for the API health endpoint', () => {
    cy.request({
      method: 'GET',
      url: '/api/health',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204])
    })
  })

  it('should load static assets', () => {
    cy.visit('/')
    cy.document().its('readyState').should('eq', 'complete')
    cy.get('body').should('not.be.empty')
  })
})
