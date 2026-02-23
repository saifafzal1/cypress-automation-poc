import ContactPage from '../../../pages/ContactPage'

describe('Regression: Contact Form', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    ContactPage.visitContactPage()
  })

  it('should submit contact form with valid data', () => {
    cy.fixture('forms').then((forms) => {
      ContactPage.fillContactForm(forms.contactForm.valid)
      ContactPage.submitForm()
      ContactPage.verifyConfirmation()
    })
  })

  it('should show validation errors for empty form submission', () => {
    ContactPage.submitForm()
    ContactPage.verifyNameError()
    ContactPage.verifyEmailError()
    ContactPage.verifyMessageError()
  })

  it('should show error for invalid email format', () => {
    cy.fixture('forms').then((forms) => {
      ContactPage.fillContactForm(forms.contactForm.invalidEmail)
      ContactPage.submitForm()
      ContactPage.verifyEmailError()
    })
  })

  it('should reset form fields', () => {
    cy.fixture('forms').then((forms) => {
      ContactPage.fillContactForm(forms.contactForm.valid)
      ContactPage.resetForm()
      ContactPage.verifyFieldsEmpty()
    })
  })
})
