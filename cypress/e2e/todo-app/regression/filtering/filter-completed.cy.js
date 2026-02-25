import todoPage from '../../../../pages/TodoPage'

describe('Regression — Filter Completed', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
    })
  })

  it('should show only completed todos', () => {
    todoPage.filterByCompleted()
    todoPage.verifyTodoCount(1)
  })

  it('should update live when a todo is uncompleted', () => {
    todoPage.filterByCompleted()
    todoPage.verifyTodoCount(1)
    todoPage.untoggleTodo(0)
    todoPage.verifyNoTodos()
  })

  it('should show empty list when none are completed', () => {
    todoPage.untoggleTodo(0)
    todoPage.filterByCompleted()
    todoPage.verifyNoTodos()
  })
})
