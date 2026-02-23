import UserManagementPage from '../../../pages/UserManagementPage'

describe('Regression: User Roles', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    UserManagementPage.visitUserManagement()
  })

  it('should assign Admin role to a user', () => {
    UserManagementPage.assignRole(0, 'Admin')
    UserManagementPage.verifySuccessMessage('User updated successfully')
  })

  it('should assign Editor role to a user', () => {
    UserManagementPage.assignRole(0, 'Editor')
    UserManagementPage.verifySuccessMessage('User updated successfully')
  })

  it('should assign Viewer role to a user', () => {
    UserManagementPage.assignRole(0, 'Viewer')
    UserManagementPage.verifySuccessMessage('User updated successfully')
  })

  it('should display role in the user table after assignment', () => {
    UserManagementPage.assignRole(0, 'Admin')
    cy.get(UserManagementPage.userRows).eq(0).should('contain.text', 'Admin')
  })
})
