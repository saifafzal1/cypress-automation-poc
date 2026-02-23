import HomePage from '../../pages/HomePage'

describe('Smoke: Navigation', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    HomePage.visitHomePage()
  })

  it('should navigate to Dashboard page', () => {
    HomePage.clickNavItem('Dashboard')
    HomePage.verifyUrl('/dashboard')
  })

  it('should navigate to Users page', () => {
    HomePage.clickNavItem('Users')
    HomePage.verifyUrl('/users')
  })

  it('should navigate to Profile page', () => {
    HomePage.clickNavItem('Profile')
    HomePage.verifyUrl('/profile')
  })

  it('should navigate to Contact page', () => {
    HomePage.clickNavItem('Contact')
    HomePage.verifyUrl('/contact')
  })
})
