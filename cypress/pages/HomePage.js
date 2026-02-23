import BasePage from './BasePage'

class HomePage extends BasePage {
  // Selectors
  navMenu = '[data-testid="nav-menu"]'
  navItems = '[data-testid="nav-item"]'
  heroSection = '[data-testid="hero-section"]'
  heroTitle = '[data-testid="hero-title"]'
  footerLinks = '[data-testid="footer"] a'
  searchBar = '[data-testid="search-bar"]'
  userAvatar = '[data-testid="user-avatar"]'
  logoutButton = '[data-testid="logout-button"]'

  visitHomePage() {
    this.visit('/')
  }

  verifyHeroVisible() {
    this.verifyElementVisible(this.heroSection)
  }

  verifyHeroTitle(title) {
    this.verifyText(this.heroTitle, title)
  }

  clickNavItem(itemName) {
    cy.get(this.navMenu).contains(itemName).click()
  }

  getNavItems() {
    return cy.get(this.navItems)
  }

  verifyNavItemCount(count) {
    cy.get(this.navItems).should('have.length', count)
  }

  verifyFooterLinks() {
    cy.get(this.footerLinks).should('have.length.greaterThan', 0)
  }

  searchFor(term) {
    this.typeText(this.searchBar, term)
    cy.get(this.searchBar).type('{enter}')
  }

  clickUserAvatar() {
    this.clickElement(this.userAvatar)
  }

  clickLogout() {
    this.clickElement(this.logoutButton)
  }

  verifyPageTitle(title) {
    cy.title().should('include', title)
  }
}

export default new HomePage()
