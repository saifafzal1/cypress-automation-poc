import appointmentPage from '../../../pages/AppointmentPage'

describe('Regression — Date Selection', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should enter a visit date', () => {
    appointmentPage.enterVisitDate('15/03/2026')
    cy.get(appointmentPage.visitDateInput).should('have.value', '15/03/2026')
  })

  it('should clear and re-enter a visit date', () => {
    appointmentPage.enterVisitDate('01/01/2026')
    appointmentPage.enterVisitDate('20/06/2026')
    cy.get(appointmentPage.visitDateInput).should('have.value', '20/06/2026')
  })

  it('should accept different date formats', () => {
    appointmentPage.enterVisitDate('25/12/2025')
    cy.get(appointmentPage.visitDateInput).should('have.value', '25/12/2025')
  })

  it('should have an empty date field by default', () => {
    cy.get(appointmentPage.visitDateInput).should('have.value', '')
  })
})
