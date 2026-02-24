import historyPage from '../../../pages/HistoryPage'
import appointmentPage from '../../../pages/AppointmentPage'

describe('Regression — Appointment History', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should access the history page', () => {
    historyPage.visitHistoryPage()
    historyPage.verifyHistoryPageLoaded()
  })

  it('should display history heading', () => {
    historyPage.visitHistoryPage()
    historyPage.verifyHistoryHeading()
  })

  it('should show appointment after booking one', () => {
    cy.fixture('appointments').then((appt) => {
      // Book an appointment first
      appointmentPage.bookAppointment(appt.validAppointment)
      // Navigate to history
      historyPage.visitHistoryPage()
      historyPage.verifyHistoryPageLoaded()
    })
  })
})
