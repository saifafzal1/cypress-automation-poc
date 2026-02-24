import BasePage from './BasePage'

class HistoryPage extends BasePage {
  // Selectors
  historySection = 'section#history'
  historyHeading = 'h2'
  appointmentEntries = '.panel'
  appointmentDate = '.panel-heading'
  appointmentDetails = '.panel-body'
  noRecordsMessage = 'p'
  goToHomepageButton = 'a.btn-default'

  visitHistoryPage() {
    this.visit('/history.php#history')
  }

  verifyHistoryPageLoaded() {
    cy.url().should('include', 'history')
  }

  verifyHistoryHeading() {
    this.verifyText(this.historyHeading, 'History')
  }

  getAppointmentCount() {
    return cy.get(this.appointmentEntries).its('length')
  }

  verifyAppointmentExists() {
    cy.get(this.appointmentEntries).should('have.length.greaterThan', 0)
  }

  verifyNoAppointments() {
    cy.get('body').should('contain.text', 'No appointment')
  }

  getFirstAppointmentDetails() {
    return cy.get(this.appointmentEntries).first().find(this.appointmentDetails)
  }

  verifyAppointmentDetailContains(text) {
    cy.get(this.appointmentDetails).first().should('contain.text', text)
  }

  clickGoToHomepage() {
    this.clickElement(this.goToHomepageButton)
  }

  navigateToHistory() {
    this.openSidebar()
    cy.get('.sidebar-nav').find('a').contains('History').click()
  }
}

export default new HistoryPage()
