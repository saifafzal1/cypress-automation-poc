// ── Login via UI ──
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/profile.php#login')
  cy.get('#txt-username').clear().type(username)
  cy.get('#txt-password').clear().type(password)
  cy.get('#btn-login').click()
  cy.url().should('include', 'appointment')
})

// ── Login with fixture data ──
Cypress.Commands.add('loginWithFixture', () => {
  cy.fixture('users').then((users) => {
    cy.login(users.validUser.username, users.validUser.password)
  })
})

// ── Book an appointment via UI ──
Cypress.Commands.add('bookAppointment', (appointmentData) => {
  cy.get('#combo_facility').select(appointmentData.facility)
  if (appointmentData.readmission) {
    cy.get('#chk_hospotal_readmission').check()
  }
  const programMap = {
    'Medicare': '#radio_program_medicare',
    'Medicaid': '#radio_program_medicaid',
    'None': '#radio_program_none'
  }
  cy.get(programMap[appointmentData.program]).check()
  cy.get('#txt_visit_date').clear().type(appointmentData.visitDate)
  // Dismiss the datepicker popup so it doesn't cover other elements
  cy.get('section#appointment h2').click()
  if (appointmentData.comment) {
    cy.get('#txt_comment').clear({ force: true }).type(appointmentData.comment, { force: true })
  }
  cy.get('#btn-book-appointment').click()
})

// ── Intercept and wait for API response ──
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias)
})
