import UserManagementPage from '../../../pages/UserManagementPage'

describe('Regression: Edit User', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    UserManagementPage.visitUserManagement()
  })

  it('should edit an existing user name', () => {
    cy.fixture('users').then((users) => {
      UserManagementPage.editUser(0, { name: users.editUser.name })
      UserManagementPage.verifySuccessMessage('User updated successfully')
      UserManagementPage.verifyUserInTable(users.editUser.name)
    })
  })

  it('should edit an existing user email', () => {
    cy.fixture('users').then((users) => {
      UserManagementPage.editUser(0, { email: users.editUser.email })
      UserManagementPage.verifySuccessMessage('User updated successfully')
    })
  })

  it('should edit user role', () => {
    cy.fixture('users').then((users) => {
      UserManagementPage.editUser(0, { role: users.editUser.role })
      UserManagementPage.verifySuccessMessage('User updated successfully')
    })
  })

  it('should cancel edit without saving changes', () => {
    UserManagementPage.editUser(0, {})
    UserManagementPage.clickElement(UserManagementPage.cancelButton)
    UserManagementPage.verifyElementNotVisible(UserManagementPage.userModal)
  })
})
