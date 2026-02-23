import UserManagementPage from '../../../pages/UserManagementPage'

describe('Regression: Create User', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    UserManagementPage.visitUserManagement()
  })

  it('should create a new user with all fields', () => {
    cy.fixture('users').then((users) => {
      UserManagementPage.createUser(users.createUser)
      UserManagementPage.verifySuccessMessage('User created successfully')
      UserManagementPage.verifyUserInTable(users.createUser.name)
    })
  })

  it('should show validation error for empty name', () => {
    UserManagementPage.clickCreateUser()
    UserManagementPage.clickElement(UserManagementPage.saveButton)
    cy.get('[data-testid="user-name-error"]').should('be.visible')
  })

  it('should show validation error for invalid email', () => {
    UserManagementPage.clickCreateUser()
    UserManagementPage.typeText(UserManagementPage.nameInput, 'Test User')
    UserManagementPage.typeText(UserManagementPage.emailInput, 'invalid-email')
    UserManagementPage.clickElement(UserManagementPage.saveButton)
    cy.get('[data-testid="user-email-error"]').should('be.visible')
  })

  it('should cancel user creation', () => {
    UserManagementPage.clickCreateUser()
    UserManagementPage.verifyElementVisible(UserManagementPage.userModal)
    UserManagementPage.clickElement(UserManagementPage.cancelButton)
    UserManagementPage.verifyElementNotVisible(UserManagementPage.userModal)
  })
})
