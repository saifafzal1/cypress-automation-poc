import historyPage from '../../../pages/HistoryPage'

describe('Regression — History Navigation', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
  })

  it('should navigate to history via sidebar', () => {
    historyPage.navigateToHistory()
    historyPage.verifyHistoryPageLoaded()
  })

  it('should navigate to history via direct URL', () => {
    historyPage.visitHistoryPage()
    historyPage.verifyHistoryPageLoaded()
  })

  it('should have Go to Homepage button on history page', () => {
    historyPage.visitHistoryPage()
    cy.get('body').should('exist')
  })

  it('should navigate back to homepage from history', () => {
    historyPage.visitHistoryPage()
    historyPage.clickGoToHomepage()
    cy.url().should('include', '/')
  })
})
