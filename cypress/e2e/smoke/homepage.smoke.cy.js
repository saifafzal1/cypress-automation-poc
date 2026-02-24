import homePage from '../../pages/HomePage'

describe('Smoke — Homepage', () => {
  beforeEach(() => {
    homePage.visitHomePage()
  })

  it('should load the homepage successfully', () => {
    homePage.verifyHeroVisible()
    homePage.verifyPageTitle('CURA Healthcare Service')
  })

  it('should display the Make Appointment button', () => {
    homePage.verifyMakeAppointmentButtonVisible()
  })

  it('should navigate to login when clicking Make Appointment', () => {
    homePage.clickMakeAppointment()
    cy.url().should('include', 'profile.php')
  })
})
