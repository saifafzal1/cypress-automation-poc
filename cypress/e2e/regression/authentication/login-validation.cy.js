import loginPage from '../../../pages/LoginPage'

describe('Regression — Login Validation', () => {
  beforeEach(() => {
    loginPage.visitLoginPage()
  })

  it('should not login with empty username and valid password', () => {
    cy.fixture('users').then((users) => {
      loginPage.enterPassword(users.validUser.password)
      loginPage.clickLogin()
      // Should stay on login or show error
      cy.url().should('not.include', 'appointment')
    })
  })

  it('should not login with valid username and empty password', () => {
    cy.fixture('users').then((users) => {
      loginPage.enterUsername(users.validUser.username)
      loginPage.clickLogin()
      cy.url().should('not.include', 'appointment')
    })
  })

  it('should not login with both fields empty', () => {
    loginPage.clickLogin()
    cy.url().should('not.include', 'appointment')
  })

  it('should have password field masked', () => {
    cy.get(loginPage.passwordInput).should('have.attr', 'type', 'password')
  })

  it('should have username field accepting text input', () => {
    cy.get(loginPage.usernameInput).should('have.attr', 'type', 'text')
  })

  it('should display the login header text', () => {
    loginPage.verifyText('h2', 'Login')
  })
})
