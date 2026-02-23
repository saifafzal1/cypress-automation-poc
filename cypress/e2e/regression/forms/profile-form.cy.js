import ProfilePage from '../../../pages/ProfilePage'

describe('Regression: Profile Form', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password)
    })
    ProfilePage.visitProfile()
  })

  it('should load profile page with existing data', () => {
    ProfilePage.verifyProfileLoaded()
  })

  it('should update profile name successfully', () => {
    cy.fixture('forms').then((forms) => {
      ProfilePage.updateName(forms.profileForm.updated.name)
      ProfilePage.clickSave()
      ProfilePage.verifySaveSuccess()
    })
  })

  it('should update all profile fields', () => {
    cy.fixture('forms').then((forms) => {
      ProfilePage.updateProfile(forms.profileForm.updated)
      ProfilePage.clickSave()
      ProfilePage.verifySaveSuccess()
    })
  })

  it('should cancel profile update without saving', () => {
    ProfilePage.updateName('Temporary Name')
    ProfilePage.clickCancel()
    ProfilePage.verifyProfileLoaded()
  })

  it('should persist updated data after save', () => {
    cy.fixture('forms').then((forms) => {
      ProfilePage.updateName(forms.profileForm.updated.name)
      ProfilePage.clickSave()
      ProfilePage.verifySaveSuccess()
      // Reload and verify persistence
      cy.reload()
      ProfilePage.verifyFieldValue('name', forms.profileForm.updated.name)
    })
  })
})
