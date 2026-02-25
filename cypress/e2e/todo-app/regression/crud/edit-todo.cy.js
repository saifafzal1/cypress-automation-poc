import todoPage from '../../../../pages/TodoPage'

describe('Regression — Edit Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should enter edit mode on double-click', () => {
    cy.get(todoPage.todoItems).eq(0).find('label').dblclick()
    cy.get(todoPage.todoItems).eq(0).find(todoPage.editInput).should('be.visible')
  })

  it('should save edit on Enter', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.editTodo(0, todos.editedTodo)
      todoPage.verifyTodoTextContains(0, todos.editedTodo)
    })
  })

  it('should allow editing multiple todos independently', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.editTodo(0, 'Updated first')
      todoPage.editTodo(1, 'Updated second')
      todoPage.verifyTodoText(0, 'Updated first')
      todoPage.verifyTodoText(1, 'Updated second')
      todoPage.verifyTodoTextContains(2, todos.multipleTodos[2])
    })
  })

  it('should trim whitespace on edit', () => {
    todoPage.editTodo(0, '   Trimmed todo   ')
    todoPage.verifyTodoText(0, 'Trimmed todo')
  })

  it('should exit edit mode after saving', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.editTodo(0, todos.editedTodo)
      cy.get(todoPage.todoItems).eq(0).find(todoPage.editInput).should('not.exist')
    })
  })

  it('should not affect other todos when editing one', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.editTodo(0, todos.editedTodo)
      todoPage.verifyTodoTextContains(1, todos.multipleTodos[1])
      todoPage.verifyTodoTextContains(2, todos.multipleTodos[2])
    })
  })
})
