import todoPage from '../../../../pages/TodoPage'

describe('Regression — Filter Active', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
    })
  })

  it('should show only active (non-completed) todos', () => {
    todoPage.filterByActive()
    todoPage.verifyTodoCount(2)
  })

  it('should update live when a todo is completed', () => {
    todoPage.filterByActive()
    todoPage.verifyTodoCount(2)
    todoPage.toggleTodo(0)
    todoPage.verifyTodoCount(1)
  })

  it('should show empty list when all are completed', () => {
    todoPage.toggleTodo(1)
    todoPage.toggleTodo(2)
    todoPage.filterByActive()
    todoPage.verifyNoTodos()
  })
})
