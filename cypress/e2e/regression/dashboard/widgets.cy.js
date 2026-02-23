import DashboardPage from '../../../pages/DashboardPage'

describe('Regression: Dashboard Widgets', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    DashboardPage.visitDashboard()
  })

  it('should display all dashboard widgets', () => {
    DashboardPage.verifyDashboardLoaded()
    DashboardPage.verifyWidgetCount(4)
  })

  it('should display correct Total Users widget data', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.verifyWidgetData('Total Users', data.widgets.totalUsers)
    })
  })

  it('should display correct Active Users widget data', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.verifyWidgetData('Active Users', data.widgets.activeUsers)
    })
  })

  it('should display correct Revenue widget data', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.verifyWidgetData('Revenue', data.widgets.revenue)
    })
  })

  it('should display correct Orders widget data', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.verifyWidgetData('Orders', data.widgets.orders)
    })
  })
})
