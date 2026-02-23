import LoginPage from '../../../pages/LoginPage'
import DashboardPage from '../../../pages/DashboardPage'

describe('Regression: Login', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage()
  })

  it('should login successfully with valid credentials', () => {
    cy.fixture('users').then((users) => {
      LoginPage.login(users.validUser.username, users.validUser.password)
      DashboardPage.verifyDashboardLoaded()
    })
  })

  it('should show error for invalid credentials', () => {
    cy.fixture('users').then((users) => {
      LoginPage.login(users.invalidUser.username, users.invalidUser.password)
      LoginPage.verifyErrorMessage('Invalid username or password')
    })
  })

  it('should show error for locked account', () => {
    cy.fixture('users').then((users) => {
      LoginPage.login(users.lockedUser.username, users.lockedUser.password)
      LoginPage.verifyErrorMessage('Account is locked')
    })
  })

  it('should show validation errors for empty fields', () => {
    LoginPage.clickLogin()
    LoginPage.verifyFieldValidationError('username')
    LoginPage.verifyFieldValidationError('password')
  })

  it('should show validation error for empty username only', () => {
    LoginPage.enterPassword('SomePassword')
    LoginPage.clickLogin()
    LoginPage.verifyFieldValidationError('username')
  })

  it('should show validation error for empty password only', () => {
    LoginPage.enterUsername('someuser')
    LoginPage.clickLogin()
    LoginPage.verifyFieldValidationError('password')
  })
})
