import appointmentPage from '../../../pages/AppointmentPage'

describe('Regression — Appointment Form Validation', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should have hospital readmission checkbox unchecked by default', () => {
    appointmentPage.verifyReadmissionUnchecked()
  })

  it('should toggle hospital readmission checkbox', () => {
    appointmentPage.checkHospitalReadmission()
    appointmentPage.verifyReadmissionChecked()
    appointmentPage.uncheckHospitalReadmission()
    appointmentPage.verifyReadmissionUnchecked()
  })

  it('should select Medicare healthcare program', () => {
    appointmentPage.selectHealthcareProgram('Medicare')
    appointmentPage.verifyProgramSelected('Medicare')
  })

  it('should select Medicaid healthcare program', () => {
    appointmentPage.selectHealthcareProgram('Medicaid')
    appointmentPage.verifyProgramSelected('Medicaid')
  })

  it('should select None healthcare program', () => {
    appointmentPage.selectHealthcareProgram('None')
    appointmentPage.verifyProgramSelected('None')
  })

  it('should enter and verify comment text', () => {
    const comment = 'Test appointment comment'
    appointmentPage.enterComment(comment)
    appointmentPage.verifyCommentValue(comment)
  })
})
