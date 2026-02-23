import BasePage from './BasePage'

class DashboardPage extends BasePage {
  // Selectors
  dashboardContainer = '[data-testid="dashboard-container"]'
  widgets = '[data-testid="widget"]'
  widgetTitle = '[data-testid="widget-title"]'
  widgetValue = '[data-testid="widget-value"]'
  filterDropdown = '[data-testid="filter-dropdown"]'
  filterOption = '[data-testid="filter-option"]'
  resetFiltersButton = '[data-testid="reset-filters"]'
  charts = '[data-testid="chart"]'
  chartCanvas = '[data-testid="chart"] canvas'
  dataTable = '[data-testid="data-table"]'
  tableRows = '[data-testid="data-table"] tbody tr'
  dateRangePicker = '[data-testid="date-range-picker"]'

  visitDashboard() {
    this.visit('/dashboard')
  }

  verifyDashboardLoaded() {
    this.verifyElementVisible(this.dashboardContainer)
  }

  verifyWidgetCount(count) {
    cy.get(this.widgets).should('have.length', count)
  }

  verifyWidgetData(widgetName, expectedValue) {
    cy.get(this.widgets)
      .contains(this.widgetTitle, widgetName)
      .parent()
      .find(this.widgetValue)
      .should('contain.text', expectedValue)
  }

  applyFilter(filterName) {
    cy.get(this.filterDropdown).click()
    cy.get(this.filterOption).contains(filterName).click()
  }

  resetFilters() {
    this.clickElement(this.resetFiltersButton)
  }

  verifyChartRendered(chartIndex) {
    cy.get(this.charts).eq(chartIndex).should('be.visible')
    cy.get(this.chartCanvas).eq(chartIndex).should('exist')
  }

  verifyChartCount(count) {
    cy.get(this.charts).should('have.length', count)
  }

  verifyTableRowCount(count) {
    cy.get(this.tableRows).should('have.length', count)
  }

  getTableData() {
    return cy.get(this.tableRows)
  }

  selectDateRange(startDate, endDate) {
    cy.get(this.dateRangePicker).click()
    cy.get('[data-testid="start-date"]').clear().type(startDate)
    cy.get('[data-testid="end-date"]').clear().type(endDate)
    cy.get('[data-testid="apply-date"]').click()
  }
}

export default new DashboardPage()
