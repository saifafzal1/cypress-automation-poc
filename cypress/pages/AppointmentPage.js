import BasePage from './BasePage'

class AppointmentPage extends BasePage {
  // Selectors
  facilityDropdown = '#combo_facility'
  hospitalReadmissionCheckbox = '#chk_hosp498'
  medicareRadio = '#radio_program_medicare'
  medicaidRadio = '#radio_program_medicaid'
  noneRadio = '#radio_program_none'
  visitDateInput = '#txt_visit_date'
  commentTextarea = '#txt_comment'
  bookAppointmentButton = '#btn-book-appointment'
  appointmentHeading = 'h2'

  visitAppointmentPage() {
    this.visit('/#appointment')
  }

  verifyAppointmentPageLoaded() {
    this.verifyText(this.appointmentHeading, 'Make Appointment')
  }

  selectFacility(facilityName) {
    cy.get(this.facilityDropdown).select(facilityName)
  }

  checkHospitalReadmission() {
    cy.get(this.hospitalReadmissionCheckbox).check()
  }

  uncheckHospitalReadmission() {
    cy.get(this.hospitalReadmissionCheckbox).uncheck()
  }

  selectHealthcareProgram(program) {
    switch (program.toLowerCase()) {
      case 'medicare':
        cy.get(this.medicareRadio).check()
        break
      case 'medicaid':
        cy.get(this.medicaidRadio).check()
        break
      case 'none':
        cy.get(this.noneRadio).check()
        break
    }
  }

  enterVisitDate(date) {
    cy.get(this.visitDateInput).clear().type(date)
  }

  enterComment(comment) {
    cy.get(this.commentTextarea).clear().type(comment)
  }

  clickBookAppointment() {
    this.clickElement(this.bookAppointmentButton)
  }

  bookAppointment(appointmentData) {
    this.selectFacility(appointmentData.facility)
    if (appointmentData.readmission) {
      this.checkHospitalReadmission()
    }
    this.selectHealthcareProgram(appointmentData.program)
    this.enterVisitDate(appointmentData.visitDate)
    if (appointmentData.comment) {
      this.enterComment(appointmentData.comment)
    }
    this.clickBookAppointment()
  }

  verifyFacilityOptions() {
    return cy.get(this.facilityDropdown).find('option')
  }

  verifyFacilitySelected(facility) {
    cy.get(this.facilityDropdown).should('have.value', facility)
  }

  verifyProgramSelected(program) {
    switch (program.toLowerCase()) {
      case 'medicare':
        cy.get(this.medicareRadio).should('be.checked')
        break
      case 'medicaid':
        cy.get(this.medicaidRadio).should('be.checked')
        break
      case 'none':
        cy.get(this.noneRadio).should('be.checked')
        break
    }
  }

  verifyReadmissionChecked() {
    cy.get(this.hospitalReadmissionCheckbox).should('be.checked')
  }

  verifyReadmissionUnchecked() {
    cy.get(this.hospitalReadmissionCheckbox).should('not.be.checked')
  }

  verifyCommentValue(comment) {
    cy.get(this.commentTextarea).should('have.value', comment)
  }
}

export default new AppointmentPage()
