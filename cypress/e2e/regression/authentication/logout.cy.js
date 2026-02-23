import HomePage from '../../../pages/HomePage'
import LoginPage from '../../../pages/LoginPage'

describe('Regression: Logout', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should logout from homepage', () => {
    HomePage.visitHomePage()
    HomePage.clickUserAvatar()
    HomePage.clickLogout()
    LoginPage.verifyLoginPageVisible()
    LoginPage.verifyUrl('/login')
  })

  it('should logout from dashboard', () => {
    cy.visit('/dashboard')
    HomePage.clickUserAvatar()
    HomePage.clickLogout()
    LoginPage.verifyLoginPageVisible()
  })

  it('should not access protected pages after logout', () => {
    HomePage.visitHomePage()
    HomePage.clickUserAvatar()
    HomePage.clickLogout()
    cy.visit('/dashboard')
    LoginPage.verifyUrl('/login')
  })
})
