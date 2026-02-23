import BasePage from './BasePage'

class ProfilePage extends BasePage {
  // Selectors
  profileContainer = '[data-testid="profile-container"]'
  nameField = '[data-testid="profile-name"]'
  emailField = '[data-testid="profile-email"]'
  phoneField = '[data-testid="profile-phone"]'
  bioField = '[data-testid="profile-bio"]'
  avatarUpload = '[data-testid="avatar-upload"]'
  avatarPreview = '[data-testid="avatar-preview"]'
  saveButton = '[data-testid="profile-save"]'
  cancelButton = '[data-testid="profile-cancel"]'
  successMessage = '[data-testid="profile-success"]'
  errorMessage = '[data-testid="profile-error"]'

  visitProfile() {
    this.visit('/profile')
  }

  verifyProfileLoaded() {
    this.verifyElementVisible(this.profileContainer)
  }

  updateName(name) {
    this.typeText(this.nameField, name)
  }

  updateEmail(email) {
    this.typeText(this.emailField, email)
  }

  updatePhone(phone) {
    this.typeText(this.phoneField, phone)
  }

  updateBio(bio) {
    this.typeText(this.bioField, bio)
  }

  updateProfile(profileData) {
    if (profileData.name) this.updateName(profileData.name)
    if (profileData.email) this.updateEmail(profileData.email)
    if (profileData.phone) this.updatePhone(profileData.phone)
    if (profileData.bio) this.updateBio(profileData.bio)
  }

  uploadAvatar(filePath) {
    cy.get(this.avatarUpload).selectFile(filePath)
  }

  clickSave() {
    this.clickElement(this.saveButton)
  }

  clickCancel() {
    this.clickElement(this.cancelButton)
  }

  verifySaveSuccess() {
    this.verifyElementVisible(this.successMessage)
  }

  verifyFieldValue(field, expectedValue) {
    cy.get(`[data-testid="profile-${field}"]`).should('have.value', expectedValue)
  }
}

export default new ProfilePage()
