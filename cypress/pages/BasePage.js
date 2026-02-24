class BasePage {
  // ── Navigation ──
  sidebarToggle = '#menu-toggle'
  sidebarMenu = '.sidebar-nav'
  homeLink = 'a[href="./"]'

  visit(path) {
    cy.visit(path)
  }

  getElement(selector) {
    return cy.get(selector)
  }

  clickElement(selector) {
    cy.get(selector).click()
  }

  typeText(selector, text) {
    cy.get(selector).clear().type(text)
  }

  verifyUrl(path) {
    cy.url().should('include', path)
  }

  verifyElementVisible(selector) {
    cy.get(selector).should('be.visible')
  }

  verifyElementNotVisible(selector) {
    cy.get(selector).should('not.be.visible')
  }

  verifyText(selector, text) {
    cy.get(selector).should('contain.text', text)
  }

  waitForPageLoad() {
    cy.document().its('readyState').should('eq', 'complete')
  }

  getById(id) {
    return cy.get(`#${id}`)
  }

  openSidebar() {
    cy.get(this.sidebarToggle).click()
  }

  navigateHome() {
    this.openSidebar()
    cy.get(this.sidebarMenu).find('a').contains('Home').click()
  }

  verifyPageTitle(expectedTitle) {
    cy.title().should('include', expectedTitle)
  }
}

export default BasePage
