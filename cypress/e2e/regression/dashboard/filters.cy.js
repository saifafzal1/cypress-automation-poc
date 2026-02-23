import DashboardPage from '../../../pages/DashboardPage'

describe('Regression: Dashboard Filters', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    DashboardPage.visitDashboard()
  })

  it('should apply date range filter', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.applyFilter(data.filters.dateRange)
      DashboardPage.verifyDashboardLoaded()
    })
  })

  it('should apply category filter', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.applyFilter(data.filters.category)
      DashboardPage.verifyDashboardLoaded()
    })
  })

  it('should apply status filter', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.applyFilter(data.filters.status)
      DashboardPage.verifyDashboardLoaded()
    })
  })

  it('should reset all filters', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.applyFilter(data.filters.category)
      DashboardPage.resetFilters()
      DashboardPage.verifyDashboardLoaded()
      DashboardPage.verifyWidgetCount(4)
    })
  })

  it('should update table data when filter is applied', () => {
    cy.fixture('dashboard').then((data) => {
      DashboardPage.applyFilter(data.filters.status)
      DashboardPage.getTableData().should('have.length.greaterThan', 0)
    })
  })
})
