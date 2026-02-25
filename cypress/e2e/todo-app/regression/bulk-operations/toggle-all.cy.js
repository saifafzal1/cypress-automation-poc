import todoPage from '../../../../pages/TodoPage'

describe('Regression — Toggle All', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should mark all todos as complete', () => {
    todoPage.toggleAll()
    cy.fixture('todos').then((todos) => {
      todos.multipleTodos.forEach((_, index) => {
        todoPage.verifyTodoCompleted(index)
      })
    })
  })

  it('should unmark all todos when all are complete', () => {
    todoPage.toggleAll()
    todoPage.untoggleAll()
    cy.fixture('todos').then((todos) => {
      todos.multipleTodos.forEach((_, index) => {
        todoPage.verifyTodoNotCompleted(index)
      })
    })
  })

  it('should set items-left to zero when all toggled complete', () => {
    todoPage.toggleAll()
    todoPage.verifyItemsLeft(0)
  })

  it('should handle manual uncomplete after toggle-all', () => {
    todoPage.toggleAll()
    todoPage.verifyItemsLeft(0)
    todoPage.untoggleTodo(1)
    todoPage.verifyItemsLeft(1)
    todoPage.verifyTodoNotCompleted(1)
  })
})
