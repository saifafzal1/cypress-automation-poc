import todoPage from '../../../../pages/TodoPage'

describe('Regression — Delete Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should show destroy button (force-clickable)', () => {
    cy.get(todoPage.todoItems).eq(0).find(todoPage.destroyButton).should('exist')
  })

  it('should remove todo from the DOM after delete', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.deleteTodo(0)
      todoPage.verifyTodoNotExist(todos.multipleTodos[0])
    })
  })

  it('should update items-left count after delete', () => {
    todoPage.verifyItemsLeft(3)
    todoPage.deleteTodo(0)
    todoPage.verifyItemsLeft(2)
  })

  it('should hide footer when last todo is deleted', () => {
    todoPage.deleteTodo(2)
    todoPage.deleteTodo(1)
    todoPage.deleteTodo(0)
    todoPage.verifyFooterNotExist()
  })
})
