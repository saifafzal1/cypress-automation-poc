import todoPage from '../../../pages/TodoPage'

describe('Smoke — Delete Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should delete a todo item', () => {
    todoPage.deleteTodo(1)
    todoPage.verifyTodoCount(2)
  })

  it('should remove the correct todo item', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.deleteTodo(1)
      todoPage.verifyTodoNotExist(todos.multipleTodos[1])
      todoPage.verifyTodoExists(todos.multipleTodos[0])
      todoPage.verifyTodoExists(todos.multipleTodos[2])
    })
  })
})
