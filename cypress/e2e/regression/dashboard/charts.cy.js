import DashboardPage from '../../../pages/DashboardPage'

describe('Regression: Dashboard Charts', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    DashboardPage.visitDashboard()
  })

  it('should render all charts', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.verifyChartCount(data.chartCount)
    })
  })

  it('should render first chart correctly', () => {
    DashboardPage.verifyChartRendered(0)
  })

  it('should render second chart correctly', () => {
    DashboardPage.verifyChartRendered(1)
  })

  it('should render third chart correctly', () => {
    DashboardPage.verifyChartRendered(2)
  })

  it('should update charts when date range changes', () => {
    DashboardPage.selectDateRange('2025-01-01', '2025-06-30')
    DashboardPage.verifyChartCount(3)
  })
})
