import BasePage from './BasePage'

class ContactPage extends BasePage {
  // Selectors
  contactForm = '[data-testid="contact-form"]'
  nameField = '[data-testid="contact-name"]'
  emailField = '[data-testid="contact-email"]'
  subjectField = '[data-testid="contact-subject"]'
  messageField = '[data-testid="contact-message"]'
  submitButton = '[data-testid="contact-submit"]'
  resetButton = '[data-testid="contact-reset"]'
  successMessage = '[data-testid="contact-success"]'
  nameError = '[data-testid="contact-name-error"]'
  emailError = '[data-testid="contact-email-error"]'
  messageError = '[data-testid="contact-message-error"]'

  visitContactPage() {
    this.visit('/contact')
  }

  verifyFormLoaded() {
    this.verifyElementVisible(this.contactForm)
  }

  fillContactForm(formData) {
    if (formData.name) this.typeText(this.nameField, formData.name)
    if (formData.email) this.typeText(this.emailField, formData.email)
    if (formData.subject) this.typeText(this.subjectField, formData.subject)
    if (formData.message) this.typeText(this.messageField, formData.message)
  }

  submitForm() {
    this.clickElement(this.submitButton)
  }

  resetForm() {
    this.clickElement(this.resetButton)
  }

  verifyConfirmation() {
    this.verifyElementVisible(this.successMessage)
  }

  verifyNameError() {
    this.verifyElementVisible(this.nameError)
  }

  verifyEmailError() {
    this.verifyElementVisible(this.emailError)
  }

  verifyMessageError() {
    this.verifyElementVisible(this.messageError)
  }

  verifyFieldsEmpty() {
    cy.get(this.nameField).should('have.value', '')
    cy.get(this.emailField).should('have.value', '')
    cy.get(this.messageField).should('have.value', '')
  }
}

export default new ContactPage()
