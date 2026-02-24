import appointmentPage from '../../../pages/AppointmentPage'
import confirmationPage from '../../../pages/ConfirmationPage'
import homePage from '../../../pages/HomePage'

describe('Regression — End-to-End Booking Flow', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should complete full booking flow and return to homepage', () => {
    cy.fixture('appointments').then((appt) => {
      // Book appointment
      appointmentPage.bookAppointment(appt.validAppointment)

      // Verify confirmation
      confirmationPage.verifyConfirmationPageLoaded()
      confirmationPage.verifyAllDetails(appt.validAppointment)

      // Return to homepage
      confirmationPage.clickGoToHomepage()
      cy.url().should('include', '/')
    })
  })

  it('should book with Medicaid program and Seoul facility', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.anotherAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
      confirmationPage.verifyFacility(appt.anotherAppointment.facility)
      confirmationPage.verifyProgram(appt.anotherAppointment.program)
    })
  })

  it('should book with minimal details (no readmission, no comment)', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.minimalAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
      confirmationPage.verifyReadmission('No')
    })
  })
})
