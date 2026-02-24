import BasePage from './BasePage'

class LoginPage extends BasePage {
  // Selectors
  usernameInput = '#txt-username'
  passwordInput = '#txt-password'
  loginButton = '#btn-login'
  loginSection = 'section#login'
  loginHeader = 'section#login h2'
  errorMessage = 'p.text-danger'

  visitLoginPage() {
    this.visit('/profile.php#login')
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

  login(username, password) {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLogin()
  }

  verifyLoginPageVisible() {
    this.verifyElementVisible(this.loginButton)
    this.verifyText(this.loginHeader, 'Login')
  }

  verifyErrorMessage(message) {
    this.verifyText(this.errorMessage, message)
  }

  verifyErrorVisible() {
    this.verifyElementVisible(this.errorMessage)
  }

  verifyUsernameFieldExists() {
    this.verifyElementVisible(this.usernameInput)
  }

  verifyPasswordFieldExists() {
    this.verifyElementVisible(this.passwordInput)
  }
}

export default new LoginPage()
