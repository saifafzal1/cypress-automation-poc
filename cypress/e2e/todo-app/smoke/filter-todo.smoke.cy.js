import todoPage from '../../../pages/TodoPage'

describe('Smoke — Filter Todos', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
    })
  })

  it('should filter active todos', () => {
    todoPage.filterByActive()
    todoPage.verifyTodoCount(2)
  })

  it('should filter completed todos', () => {
    todoPage.filterByCompleted()
    todoPage.verifyTodoCount(1)
  })

  it('should show all todos', () => {
    todoPage.filterByActive()
    todoPage.verifyTodoCount(2)
    todoPage.filterByAll()
    todoPage.verifyTodoCount(3)
  })
})
