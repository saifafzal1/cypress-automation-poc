import appointmentPage from '../../../pages/AppointmentPage'
import confirmationPage from '../../../pages/ConfirmationPage'

describe('Regression — Make Appointment', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should display the appointment form', () => {
    appointmentPage.verifyAppointmentPageLoaded()
    appointmentPage.verifyElementVisible(appointmentPage.facilityDropdown)
    appointmentPage.verifyElementVisible(appointmentPage.visitDateInput)
    appointmentPage.verifyElementVisible(appointmentPage.bookAppointmentButton)
  })

  it('should book an appointment with all fields filled', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
    })
  })

  it('should book an appointment without optional comment', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.minimalAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
    })
  })

  it('should book appointments with different facilities', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.anotherAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
      confirmationPage.verifyFacility(appt.anotherAppointment.facility)
    })
  })
})
