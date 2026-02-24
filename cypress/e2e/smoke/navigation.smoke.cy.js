import homePage from '../../pages/HomePage'

describe('Smoke — Navigation', () => {
  beforeEach(() => {
    homePage.visitHomePage()
  })

  it('should have a sidebar toggle button', () => {
    homePage.verifySidebarToggleExists()
  })

  it('should open the sidebar menu', () => {
    homePage.verifySidebarLinks()
  })

  it('should navigate to Home from sidebar', () => {
    homePage.clickSidebarLink('Home')
    cy.url().should('include', '/')
  })
})
