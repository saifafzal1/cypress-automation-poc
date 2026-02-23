import BasePage from './BasePage'

class LoginPage extends BasePage {
  // Selectors
  usernameInput = '[data-testid="username"]'
  passwordInput = '[data-testid="password"]'
  loginButton = '[data-testid="login-button"]'
  errorMessage = '[data-testid="error-message"]'
  rememberMeCheckbox = '[data-testid="remember-me"]'
  forgotPasswordLink = '[data-testid="forgot-password-link"]'
  signupLink = '[data-testid="signup-link"]'

  visitLoginPage() {
    this.visit('/login')
  }

  enterUsername(username) {
    this.typeText(this.usernameInput, username)
  }

  enterPassword(password) {
    this.typeText(this.passwordInput, password)
  }

  clickLogin() {
    this.clickElement(this.loginButton)
  }

  checkRememberMe() {
    cy.get(this.rememberMeCheckbox).check()
  }

  clickForgotPassword() {
    this.clickElement(this.forgotPasswordLink)
  }

  clickSignupLink() {
    this.clickElement(this.signupLink)
  }

  login(username, password) {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLogin()
  }

  verifyErrorMessage(message) {
    this.verifyText(this.errorMessage, message)
  }

  verifyLoginPageVisible() {
    this.verifyElementVisible(this.loginButton)
  }

  verifyFieldValidationError(field) {
    cy.get(`[data-testid="${field}-error"]`).should('be.visible')
  }
}

export default new LoginPage()
