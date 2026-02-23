import BasePage from './BasePage'

class UserManagementPage extends BasePage {
  // Selectors
  userTable = '[data-testid="user-table"]'
  userRows = '[data-testid="user-table"] tbody tr'
  createUserButton = '[data-testid="create-user-button"]'
  editUserButton = '[data-testid="edit-user-button"]'
  deleteUserButton = '[data-testid="delete-user-button"]'
  userModal = '[data-testid="user-modal"]'
  nameInput = '[data-testid="user-name"]'
  emailInput = '[data-testid="user-email"]'
  roleDropdown = '[data-testid="user-role"]'
  statusToggle = '[data-testid="user-status"]'
  saveButton = '[data-testid="save-button"]'
  cancelButton = '[data-testid="cancel-button"]'
  confirmDeleteButton = '[data-testid="confirm-delete"]'
  cancelDeleteButton = '[data-testid="cancel-delete"]'
  searchInput = '[data-testid="user-search"]'
  successMessage = '[data-testid="success-message"]'
  paginationNext = '[data-testid="pagination-next"]'

  visitUserManagement() {
    this.visit('/users')
  }

  clickCreateUser() {
    this.clickElement(this.createUserButton)
  }

  fillUserForm(userData) {
    this.typeText(this.nameInput, userData.name)
    this.typeText(this.emailInput, userData.email)
    cy.get(this.roleDropdown).select(userData.role)
  }

  createUser(userData) {
    this.clickCreateUser()
    this.verifyElementVisible(this.userModal)
    this.fillUserForm(userData)
    this.clickElement(this.saveButton)
  }

  editUser(rowIndex, newData) {
    cy.get(this.userRows).eq(rowIndex).find(this.editUserButton).click()
    this.verifyElementVisible(this.userModal)
    if (newData.name) this.typeText(this.nameInput, newData.name)
    if (newData.email) this.typeText(this.emailInput, newData.email)
    if (newData.role) cy.get(this.roleDropdown).select(newData.role)
    this.clickElement(this.saveButton)
  }

  deleteUser(rowIndex) {
    cy.get(this.userRows).eq(rowIndex).find(this.deleteUserButton).click()
    this.clickElement(this.confirmDeleteButton)
  }

  cancelDelete(rowIndex) {
    cy.get(this.userRows).eq(rowIndex).find(this.deleteUserButton).click()
    this.clickElement(this.cancelDeleteButton)
  }

  assignRole(rowIndex, role) {
    cy.get(this.userRows).eq(rowIndex).find(this.editUserButton).click()
    cy.get(this.roleDropdown).select(role)
    this.clickElement(this.saveButton)
  }

  searchUser(searchTerm) {
    this.typeText(this.searchInput, searchTerm)
  }

  verifyUserCount(count) {
    cy.get(this.userRows).should('have.length', count)
  }

  verifySuccessMessage(message) {
    this.verifyText(this.successMessage, message)
  }

  verifyUserInTable(userName) {
    cy.get(this.userTable).should('contain.text', userName)
  }

  verifyUserNotInTable(userName) {
    cy.get(this.userTable).should('not.contain.text', userName)
  }
}

export default new UserManagementPage()
