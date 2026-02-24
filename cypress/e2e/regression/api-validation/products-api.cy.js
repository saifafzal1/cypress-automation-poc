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

  it('should have correct facility options in the appointment form', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('Tokyo CURA Healthcare Center')
      expect(response.body).to.contain('Hongkong CURA Healthcare Center')
      expect(response.body).to.contain('Seoul CURA Healthcare Center')
    })
  })

  it('should have healthcare program radio buttons', () => {
    cy.request('/').then((response) => {
      expect(response.body).to.contain('radio_program_medicare')
      expect(response.body).to.contain('radio_program_medicaid')
      expect(response.body).to.contain('radio_program_none')
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
