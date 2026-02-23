import LoginPage from '../../pages/LoginPage'
import DashboardPage from '../../pages/DashboardPage'
import HomePage from '../../pages/HomePage'

describe('Sanity: Critical Path', () => {
  it('should complete full user journey — login, navigate, verify, logout', () => {
    // Step 1: Visit login page
    LoginPage.visitLoginPage()
    LoginPage.verifyLoginPageVisible()

    // Step 2: Login with valid credentials
    cy.fixture('users').then((users) => {
      LoginPage.login(users.validUser.username, users.validUser.password)
    })

    // Step 3: Verify dashboard loads
    DashboardPage.verifyDashboardLoaded()
    DashboardPage.verifyUrl('/dashboard')

    // Step 4: Navigate to homepage
    HomePage.clickNavItem('Home')
    HomePage.verifyHeroVisible()

    // Step 5: Navigate to users page
    HomePage.clickNavItem('Users')
    HomePage.verifyUrl('/users')

    // Step 6: Navigate back to dashboard
    HomePage.clickNavItem('Dashboard')
    DashboardPage.verifyDashboardLoaded()

    // Step 7: Logout
    HomePage.clickUserAvatar()
    HomePage.clickLogout()
    LoginPage.verifyLoginPageVisible()
  })
})
