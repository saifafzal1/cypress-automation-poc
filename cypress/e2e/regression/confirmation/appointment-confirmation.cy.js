import appointmentPage from '../../../pages/AppointmentPage'
import confirmationPage from '../../../pages/ConfirmationPage'

describe('Regression — Appointment Confirmation', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should display confirmation page after booking', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
    })
  })

  it('should show correct facility on confirmation', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyFacility(appt.validAppointment.facility)
    })
  })

  it('should show correct program on confirmation', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyProgram(appt.validAppointment.program)
    })
  })

  it('should show correct visit date on confirmation', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyVisitDate(appt.validAppointment.visitDate)
    })
  })
})
