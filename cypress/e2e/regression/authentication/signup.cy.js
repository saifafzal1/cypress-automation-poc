import SignupPage from '../../../pages/SignupPage'

describe('Regression: Signup', () => {
  beforeEach(() => {
    SignupPage.visitSignupPage()
  })

  it('should signup successfully with valid data', () => {
    cy.fixture('users').then((users) => {
      SignupPage.signup(users.newUser)
      SignupPage.verifySignupSuccess()
    })
  })

  it('should show error for duplicate email', () => {
    cy.fixture('users').then((users) => {
      SignupPage.signup(users.duplicateUser)
      SignupPage.verifySignupError('Email already registered')
    })
  })

  it('should show validation errors for empty required fields', () => {
    SignupPage.clickSignup()
    SignupPage.verifyFieldError('firstname')
    SignupPage.verifyFieldError('lastname')
    SignupPage.verifyFieldError('email')
    SignupPage.verifyFieldError('password')
  })

  it('should show error for password mismatch', () => {
    cy.fixture('users').then((users) => {
      const mismatchData = {
        ...users.newUser,
        confirmPassword: 'DifferentPassword@123'
      }
      SignupPage.fillSignupForm(mismatchData)
      SignupPage.acceptTerms()
      SignupPage.clickSignup()
      SignupPage.verifyFieldError('confirm-password')
    })
  })

  it('should display password strength indicator', () => {
    SignupPage.typeText(SignupPage.passwordField, 'weak')
    SignupPage.verifyPasswordStrength('Weak')

    SignupPage.typeText(SignupPage.passwordField, 'Medium@12')
    SignupPage.verifyPasswordStrength('Medium')

    SignupPage.typeText(SignupPage.passwordField, 'Str0ng@Pass!word')
    SignupPage.verifyPasswordStrength('Strong')
  })

  it('should navigate to login page via link', () => {
    SignupPage.clickLoginLink()
    SignupPage.verifyUrl('/login')
  })
})
