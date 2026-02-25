import todoPage from '../../../../pages/TodoPage'

describe('Regression — Clear Completed', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should show Clear completed button when completed todos exist', () => {
    todoPage.toggleTodo(0)
    todoPage.verifyClearCompletedVisible()
  })

  it('should remove all completed todos', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.toggleTodo(0)
      todoPage.clearCompleted()
      todoPage.verifyTodoCount(2)
      todoPage.verifyTodoNotExist(todos.multipleTodos[0])
    })
  })

  it('should leave only active todos after clearing', () => {
    todoPage.toggleTodo(0)
    todoPage.toggleTodo(1)
    todoPage.clearCompleted()
    todoPage.verifyTodoCount(1)
    todoPage.verifyItemsLeft(1)
  })
})
