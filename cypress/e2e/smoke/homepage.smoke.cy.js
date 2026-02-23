import HomePage from '../../pages/HomePage'

describe('Smoke: Homepage', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should load the homepage with key elements visible', () => {
    HomePage.visitHomePage()
    HomePage.verifyHeroVisible()
    HomePage.verifyFooterLinks()
  })

  it('should display the navigation menu', () => {
    HomePage.visitHomePage()
    HomePage.verifyElementVisible(HomePage.navMenu)
    HomePage.getNavItems().should('have.length.greaterThan', 0)
  })
})
