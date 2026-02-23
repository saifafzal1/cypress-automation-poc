import UserManagementPage from '../../../pages/UserManagementPage'

describe('Regression: Delete User', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    UserManagementPage.visitUserManagement()
  })

  it('should delete a user with confirmation', () => {
    cy.fixture('users').then((users) => {
      UserManagementPage.deleteUser(0)
      UserManagementPage.verifySuccessMessage('User deleted successfully')
    })
  })

  it('should cancel user deletion', () => {
    UserManagementPage.cancelDelete(0)
    // User should still be in the table
    cy.get(UserManagementPage.userRows).should('have.length.greaterThan', 0)
  })

  it('should update user count after deletion', () => {
    cy.get(UserManagementPage.userRows).its('length').then((initialCount) => {
      UserManagementPage.deleteUser(0)
      UserManagementPage.verifyUserCount(initialCount - 1)
    })
  })
})
