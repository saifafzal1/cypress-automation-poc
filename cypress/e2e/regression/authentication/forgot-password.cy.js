import LoginPage from '../../../pages/LoginPage'

describe('Regression: Forgot Password', () => {
  beforeEach(() => {
    LoginPage.visitLoginPage()
    LoginPage.clickForgotPassword()
  })

  it('should navigate to forgot password page', () => {
    LoginPage.verifyUrl('/forgot-password')
  })

  it('should send reset link for valid email', () => {
    cy.get('[data-testid="reset-email"]').type('admin@example.com')
    cy.get('[data-testid="reset-submit"]').click()
    cy.get('[data-testid="reset-success"]').should('be.visible')
    cy.get('[data-testid="reset-success"]').should('contain.text', 'Reset link sent')
  })

  it('should show error for unregistered email', () => {
    cy.get('[data-testid="reset-email"]').type('unknown@example.com')
    cy.get('[data-testid="reset-submit"]').click()
    cy.get('[data-testid="reset-error"]').should('be.visible')
  })

  it('should show validation error for invalid email format', () => {
    cy.get('[data-testid="reset-email"]').type('invalid-email')
    cy.get('[data-testid="reset-submit"]').click()
    cy.get('[data-testid="reset-email-error"]').should('be.visible')
  })

  it('should navigate back to login page', () => {
    cy.get('[data-testid="back-to-login"]').click()
    LoginPage.verifyUrl('/login')
  })
})
