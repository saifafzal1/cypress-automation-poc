import homePage from '../../../pages/HomePage'
import loginPage from '../../../pages/LoginPage'

describe('Regression — Logout', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should logout via sidebar menu', () => {
    homePage.openSidebar()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()
    cy.url().should('include', '/')
  })

  it('should redirect to login when accessing appointment page after logout', () => {
    homePage.openSidebar()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()
    cy.visit('/#appointment')
    cy.url().should('include', 'profile.php').or('include', '/')
  })

  it('should be able to login again after logout', () => {
    homePage.openSidebar()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()
    cy.fixture('users').then((users) => {
      loginPage.visitLoginPage()
      loginPage.login(users.validUser.username, users.validUser.password)
      cy.url().should('include', 'appointment')
    })
  })
})
