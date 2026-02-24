import appointmentPage from '../../../pages/AppointmentPage'

describe('Regression — Facility Selection', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should display all three facility options', () => {
    appointmentPage.verifyFacilityOptions().should('have.length', 3)
  })

  it('should select Tokyo CURA Healthcare Center', () => {
    appointmentPage.selectFacility('Tokyo CURA Healthcare Center')
    cy.get(appointmentPage.facilityDropdown).should('have.value', 'Tokyo CURA Healthcare Center')
  })

  it('should select Hongkong CURA Healthcare Center', () => {
    appointmentPage.selectFacility('Hongkong CURA Healthcare Center')
    cy.get(appointmentPage.facilityDropdown).should('have.value', 'Hongkong CURA Healthcare Center')
  })

  it('should select Seoul CURA Healthcare Center', () => {
    appointmentPage.selectFacility('Seoul CURA Healthcare Center')
    cy.get(appointmentPage.facilityDropdown).should('have.value', 'Seoul CURA Healthcare Center')
  })
})
