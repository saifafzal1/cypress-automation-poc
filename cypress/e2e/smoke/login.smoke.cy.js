import LoginPage from '../../pages/LoginPage'
import DashboardPage from '../../pages/DashboardPage'

describe('Smoke: Login', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage()
  })

  it('should login with valid credentials and land on dashboard', () => {
    cy.fixture('users').then((users) => {
      LoginPage.login(users.validUser.username, users.validUser.password)
      DashboardPage.verifyDashboardLoaded()
      DashboardPage.verifyUrl('/dashboard')
    })
  })

  it('should display login page elements correctly', () => {
    LoginPage.verifyElementVisible(LoginPage.usernameInput)
    LoginPage.verifyElementVisible(LoginPage.passwordInput)
    LoginPage.verifyElementVisible(LoginPage.loginButton)
  })
})
