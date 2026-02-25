import todoPage from '../../../../pages/TodoPage'

describe('Regression — State Persistence', () => {
  beforeEach(() => {
    todoPage.visitApp()
  })

  it('should maintain todos within a session', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.verifyTodoCount(3)
      // Navigate away via hash and back
      cy.window().then((win) => {
        win.location.hash = '#/active'
      })
      cy.get(todoPage.filterAll).click()
      todoPage.verifyTodoCount(3)
    })
  })

  it('should maintain completed state when switching filters', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
      todoPage.filterByActive()
      todoPage.filterByAll()
      todoPage.verifyTodoCompleted(0)
      todoPage.verifyTodoNotCompleted(1)
    })
  })

  it('should maintain state after editing and switching filters', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.singleTodo)
      todoPage.editTodo(0, todos.editedTodo)
      todoPage.filterByActive()
      todoPage.filterByAll()
      todoPage.verifyTodoTextContains(0, todos.editedTodo)
    })
  })

  it('should maintain count after deletion', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.deleteTodo(1)
      todoPage.verifyTodoCount(2)
      todoPage.verifyItemsLeft(2)
    })
  })

  it('should reflect correct state after multiple operations', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.toggleTodo(0)
      todoPage.deleteTodo(2)
      todoPage.verifyTodoCount(2)
      todoPage.verifyItemsLeft(1)
      todoPage.verifyTodoCompleted(0)
    })
  })
})
