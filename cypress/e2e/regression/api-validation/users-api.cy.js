describe('Regression — Page HTTP Responses', () => {
  it('GET / — homepage should return 200', () => {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('GET /profile.php — login page should return 200', () => {
    cy.request('/profile.php').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('GET /history.php — history page should be accessible', () => {
    cy.request({
      url: '/history.php',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302])
    })
  })

  it('should contain expected content on homepage', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('CURA Healthcare')
    })
  })

  it('should contain login form on profile page', () => {
    cy.request('/profile.php').then((response) => {
      expect(response.body).to.contain('txt-username')
      expect(response.body).to.contain('txt-password')
    })
  })

  it('POST /authenticate.php — should authenticate with valid credentials', () => {
    cy.request({
      method: 'POST',
      url: '/authenticate.php',
      form: true,
      body: {
        username: 'John Doe',
        password: 'ThisIsNotAPassword'
      },
      followRedirect: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302])
    })
  })
})
