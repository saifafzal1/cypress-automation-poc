import todoPage from '../../../../pages/TodoPage'

describe('Regression — Filter All', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
    })
  })

  it('should show all items regardless of status', () => {
    todoPage.filterByAll()
    todoPage.verifyTodoCount(3)
  })

  it('should have All filter highlighted by default', () => {
    todoPage.verifyFilterSelected('All')
  })

  it('should re-highlight All filter when clicked', () => {
    todoPage.filterByActive()
    todoPage.verifyFilterSelected('Active')
    todoPage.filterByAll()
    todoPage.verifyFilterSelected('All')
  })
})
