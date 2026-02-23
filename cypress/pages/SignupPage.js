import BasePage from './BasePage'

class SignupPage extends BasePage {
  // Selectors
  signupForm = '[data-testid="signup-form"]'
  firstNameField = '[data-testid="signup-firstname"]'
  lastNameField = '[data-testid="signup-lastname"]'
  emailField = '[data-testid="signup-email"]'
  passwordField = '[data-testid="signup-password"]'
  confirmPasswordField = '[data-testid="signup-confirm-password"]'
  termsCheckbox = '[data-testid="signup-terms"]'
  signupButton = '[data-testid="signup-button"]'
  loginLink = '[data-testid="login-link"]'
  successMessage = '[data-testid="signup-success"]'
  errorMessage = '[data-testid="signup-error"]'
  passwordStrength = '[data-testid="password-strength"]'

  visitSignupPage() {
    this.visit('/signup')
  }

  fillSignupForm(formData) {
    this.typeText(this.firstNameField, formData.firstName)
    this.typeText(this.lastNameField, formData.lastName)
    this.typeText(this.emailField, formData.email)
    this.typeText(this.passwordField, formData.password)
    this.typeText(this.confirmPasswordField, formData.confirmPassword)
  }

  acceptTerms() {
    cy.get(this.termsCheckbox).check()
  }

  clickSignup() {
    this.clickElement(this.signupButton)
  }

  signup(formData) {
    this.fillSignupForm(formData)
    this.acceptTerms()
    this.clickSignup()
  }

  clickLoginLink() {
    this.clickElement(this.loginLink)
  }

  verifySignupSuccess() {
    this.verifyElementVisible(this.successMessage)
  }

  verifySignupError(message) {
    this.verifyText(this.errorMessage, message)
  }

  verifyPasswordStrength(level) {
    cy.get(this.passwordStrength).should('contain.text', level)
  }

  verifyFieldError(fieldName) {
    cy.get(`[data-testid="signup-${fieldName}-error"]`).should('be.visible')
  }
}

export default new SignupPage()
