import BasePage from './BasePage'

class ConfirmationPage extends BasePage {
  // Selectors
  confirmationSection = 'section#summary'
  confirmationHeading = 'h2'
  facilityLabel = '#facility'
  readmissionLabel = '#hospital_readmission'
  programLabel = '#program'
  visitDateLabel = '#visit_date'
  commentLabel = '#comment'
  goToHomepageButton = 'a.btn-default'

  verifyConfirmationPageLoaded() {
    this.verifyText(this.confirmationHeading, 'Appointment Confirmation')
  }

  verifyFacility(expected) {
    this.verifyText(this.facilityLabel, expected)
  }

  verifyReadmission(expected) {
    this.verifyText(this.readmissionLabel, expected)
  }

  verifyProgram(expected) {
    this.verifyText(this.programLabel, expected)
  }

  verifyVisitDate(expected) {
    this.verifyText(this.visitDateLabel, expected)
  }

  verifyComment(expected) {
    this.verifyText(this.commentLabel, expected)
  }

  verifyAllDetails(appointmentData) {
    this.verifyFacility(appointmentData.facility)
    this.verifyReadmission(appointmentData.readmission ? 'Yes' : 'No')
    this.verifyProgram(appointmentData.program)
    this.verifyVisitDate(appointmentData.visitDate)
    if (appointmentData.comment) {
      this.verifyComment(appointmentData.comment)
    }
  }

  clickGoToHomepage() {
    this.clickElement(this.goToHomepageButton)
  }

  getFacilityText() {
    return cy.get(this.facilityLabel).invoke('text')
  }

  getVisitDateText() {
    return cy.get(this.visitDateLabel).invoke('text')
  }

  getProgramText() {
    return cy.get(this.programLabel).invoke('text')
  }
}

export default new ConfirmationPage()
