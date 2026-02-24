describe('Regression — Page Content Validation', () => {
  it('should have proper page title on homepage', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('CURA Healthcare Service')
    })
  })

  it('should have Make Appointment button on homepage', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('btn-make-appointment')
    })
  })

  it('should have sidebar navigation on homepage', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('sidebar-nav')
      expect(response.body).to.contain('menu-toggle')
    })
  })

  it('should have login form elements on profile page', () => {
    cy.request('/profile.php').then((response) => {
      expect(response.body).to.contain('txt-username')
      expect(response.body).to.contain('txt-password')
      expect(response.body).to.contain('btn-login')
    })
  })

  it('should serve pages with reasonable response time', () => {
    const startTime = Date.now()
    cy.request('/').then(() => {
      const loadTime = Date.now() - startTime
      expect(loadTime).to.be.lessThan(5000)
    })
  })
})
