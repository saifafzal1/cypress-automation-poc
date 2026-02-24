import loginPage from '../../pages/LoginPage'

describe('Smoke — Login', () => {
  beforeEach(() => {
    loginPage.visitLoginPage()
  })

  it('should display the login form', () => {
    loginPage.verifyLoginPageVisible()
    loginPage.verifyUsernameFieldExists()
    loginPage.verifyPasswordFieldExists()
  })

  it('should login with valid credentials', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.validUser.username, users.validUser.password)
      cy.url().should('include', 'appointment')
    })
  })

  it('should show error with invalid credentials', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.invalidUser.username, users.invalidUser.password)
      loginPage.verifyErrorVisible()
    })
  })
})
