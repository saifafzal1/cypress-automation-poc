import BasePage from './BasePage'

class HomePage extends BasePage {
  // Selectors
  makeAppointmentButton = '#btn-make-appointment'
  heroSection = 'header#top'
  heroTitle = '.text-vertical-center h1'
  navbar = '.navbar'
  sidebarToggle = '#menu-toggle'
  sidebarMenu = '.sidebar-nav'
  footerText = 'footer'

  visitHomePage() {
    this.visit('/')
  }

  verifyHeroVisible() {
    this.verifyElementVisible(this.heroSection)
  }

  verifyHeroTitle(title) {
    this.verifyText(this.heroTitle, title)
  }

  clickMakeAppointment() {
    this.clickElement(this.makeAppointmentButton)
  }

  verifySidebarToggleExists() {
    this.verifyElementVisible(this.sidebarToggle)
  }

  openSidebar() {
    cy.get(this.sidebarToggle).click()
  }

  verifySidebarLinks() {
    this.openSidebar()
    cy.get(this.sidebarMenu).find('a').should('have.length.greaterThan', 0)
  }

  clickSidebarLink(linkText) {
    this.openSidebar()
    cy.get(this.sidebarMenu).find('a').contains(linkText).click()
  }

  verifyFooterExists() {
    cy.get(this.footerText).should('exist')
  }

  verifyPageTitle(title) {
    cy.title().should('include', title)
  }

  verifyMakeAppointmentButtonVisible() {
    this.verifyElementVisible(this.makeAppointmentButton)
  }
}

export default new HomePage()
