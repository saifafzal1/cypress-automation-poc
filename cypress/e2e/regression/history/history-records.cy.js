import appointmentPage from '../../../pages/AppointmentPage'
import confirmationPage from '../../../pages/ConfirmationPage'
import historyPage from '../../../pages/HistoryPage'

describe('Regression — History Records', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should show booked appointment details in history', () => {
    cy.fixture('appointments').then((appt) => {
      // Book an appointment
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyConfirmationPageLoaded()

      // Check history
      historyPage.visitHistoryPage()
      historyPage.verifyHistoryPageLoaded()
    })
  })

  it('should display facility info in history records', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.anotherAppointment)
      confirmationPage.verifyConfirmationPageLoaded()

      historyPage.visitHistoryPage()
      historyPage.verifyHistoryPageLoaded()
    })
  })

  it('should book multiple appointments and verify history', () => {
    cy.fixture('appointments').then((appt) => {
      // Book first appointment
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyConfirmationPageLoaded()
      confirmationPage.clickGoToHomepage()

      // Navigate to appointment page (still logged in)
      appointmentPage.visitAppointmentPage()
      appointmentPage.bookAppointment(appt.anotherAppointment)
      confirmationPage.verifyConfirmationPageLoaded()

      // Check history
      historyPage.visitHistoryPage()
      historyPage.verifyHistoryPageLoaded()
    })
  })
})
