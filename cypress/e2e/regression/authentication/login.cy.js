import loginPage from '../../../pages/LoginPage'

describe('Regression — Login', () => {
  beforeEach(() => {
    loginPage.visitLoginPage()
  })

  it('should login successfully with valid credentials', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.validUser.username, users.validUser.password)
      cy.url().should('include', 'appointment')
    })
  })

  it('should show error for invalid username', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.invalidUsernameOnly.username, users.invalidUsernameOnly.password)
      loginPage.verifyErrorVisible()
    })
  })

  it('should show error for invalid password', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.invalidPasswordOnly.username, users.invalidPasswordOnly.password)
      loginPage.verifyErrorVisible()
    })
  })

  it('should show error for completely invalid credentials', () => {
    cy.fixture('users').then((users) => {
      loginPage.login(users.invalidUser.username, users.invalidUser.password)
      loginPage.verifyErrorVisible()
    })
  })

  it('should display all login form elements', () => {
    loginPage.verifyUsernameFieldExists()
    loginPage.verifyPasswordFieldExists()
    loginPage.verifyElementVisible(loginPage.loginButton)
  })

  it('should keep user on login page with empty credentials', () => {
    loginPage.clickLogin()
    cy.url().should('include', 'profile.php')
  })
})
