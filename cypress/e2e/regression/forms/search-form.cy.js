import HomePage from '../../../pages/HomePage'

describe('Regression: Search Form', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    HomePage.visitHomePage()
  })

  it('should return results for valid search query', () => {
    cy.fixture('forms').then((forms) => {
      HomePage.searchFor(forms.searchForm.validQuery)
      HomePage.verifyUrl('/search')
      cy.get('[data-testid="search-results"]').should('have.length.greaterThan', 0)
    })
  })

  it('should show no results message for non-matching query', () => {
    cy.fixture('forms').then((forms) => {
      HomePage.searchFor(forms.searchForm.noResultsQuery)
      cy.get('[data-testid="no-results"]').should('be.visible')
    })
  })

  it('should handle special characters safely', () => {
    cy.fixture('forms').then((forms) => {
      HomePage.searchFor(forms.searchForm.specialCharsQuery)
      // Should not break the page — XSS protection
      cy.get('[data-testid="search-results"], [data-testid="no-results"]').should('exist')
    })
  })

  it('should clear search and return to homepage', () => {
    cy.fixture('forms').then((forms) => {
      HomePage.searchFor(forms.searchForm.validQuery)
      cy.get('[data-testid="clear-search"]').click()
      HomePage.verifyUrl('/')
    })
  })
})
