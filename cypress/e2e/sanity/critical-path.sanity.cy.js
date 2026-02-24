import loginPage from '../../pages/LoginPage'
import appointmentPage from '../../pages/AppointmentPage'
import confirmationPage from '../../pages/ConfirmationPage'

describe('Sanity — Critical Path', () => {
  it('should complete full user journey: login → book → confirm', () => {
    // Step 1: Visit login page
    loginPage.visitLoginPage()
    loginPage.verifyLoginPageVisible()

    // Step 2: Login with valid credentials
    cy.fixture('users').then((users) => {
      loginPage.login(users.validUser.username, users.validUser.password)
    })

    // Step 3: Verify appointment page loads
    appointmentPage.verifyAppointmentPageLoaded()

    // Step 4: Book an appointment
    cy.fixture('appointments').then((appt) => {
      appointmentPage.bookAppointment(appt.validAppointment)
    })

    // Step 5: Verify confirmation
    confirmationPage.verifyConfirmationPageLoaded()

    // Step 6: Return to homepage
    confirmationPage.clickGoToHomepage()
    cy.url().should('include', '/')
  })
})
