import loginPage from '../../../pages/LoginPage'

describe('Regression — Logout', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should logout via sidebar menu', () => {
    cy.get('#menu-toggle').click()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()
    cy.url().should('not.include', 'appointment')
  })

  it('should be able to login again after logout', () => {
    cy.get('#menu-toggle').click()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()
    cy.fixture('users').then((users) => {
      loginPage.visitLoginPage()
      loginPage.login(users.validUser.username, users.validUser.password)
      cy.url().should('include', 'appointment')
    })
  })

  it('should show different sidebar links when logged in vs logged out', () => {
    // When logged in, sidebar should show Logout
    cy.get('#menu-toggle').click()
    cy.get('.sidebar-nav').should('contain.text', 'Logout')
    cy.get('#menu-close').click()

    // After logout
    cy.get('#menu-toggle').click()
    cy.get('.sidebar-nav').find('a').contains('Logout').click()

    // When logged out, sidebar should show Login
    cy.visit('/')
    cy.get('#menu-toggle').click()
    cy.get('.sidebar-nav').should('contain.text', 'Login')
  })
})
