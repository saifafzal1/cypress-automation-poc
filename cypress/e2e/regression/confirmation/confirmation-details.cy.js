import appointmentPage from '../../../pages/AppointmentPage'
import confirmationPage from '../../../pages/ConfirmationPage'

describe('Regression — Confirmation Details', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should show hospital readmission as Yes when checked', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyReadmission('Yes')
    })
  })

  it('should show hospital readmission as No when unchecked', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.anotherAppointment)
      confirmationPage.verifyReadmission('No')
    })
  })

  it('should show comment on confirmation', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyComment(appt.validAppointment.comment)
    })
  })

  it('should display Go to Homepage button on confirmation', () => {
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
      confirmationPage.verifyElementVisible(confirmationPage.goToHomepageButton)
    })
  })
})
