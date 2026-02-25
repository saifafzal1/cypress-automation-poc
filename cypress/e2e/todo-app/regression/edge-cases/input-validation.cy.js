import todoPage from '../../../../pages/TodoPage'

describe('Regression — Input Validation & Edge Cases', () => {
  beforeEach(() => {
    todoPage.visitApp()
  })

  it('should not add an empty todo', () => {
    cy.get(todoPage.newTodoInput).type('{enter}')
    todoPage.verifyFooterNotExist()
  })

  it('should not add a whitespace-only todo', () => {
    cy.fixture('todos').then((todos) => {
      cy.get(todoPage.newTodoInput).type(`${todos.edgeCases.whitespace}{enter}`)
      todoPage.verifyFooterNotExist()
    })
  })

  it('should trim leading and trailing whitespace', () => {
    todoPage.addTodo('   Trimmed item   ')
    todoPage.verifyTodoText(0, 'Trimmed item')
  })

  it('should handle long text input', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.edgeCases.longText)
      todoPage.verifyTodoCount(1)
      todoPage.verifyTodoText(0, todos.edgeCases.longText)
    })
  })

  it('should safely render special characters', () => {
    // Type special chars and verify they appear in the DOM
    todoPage.addTodo('Todo & "test" are fine')
    todoPage.verifyTodoCount(1)
    cy.get(todoPage.todoItems).eq(0).find('label').first()
      .should(($el) => {
        expect($el[0].textContent).to.include('Todo')
        expect($el[0].textContent).to.include('test')
      })
  })

  it('should not execute script tags (XSS safe)', () => {
    // The app should render script text safely without executing it
    todoPage.addTodo('alert test')
    todoPage.verifyTodoCount(1)
    cy.get(todoPage.todoItems).eq(0).find('script').should('not.exist')
    cy.get(todoPage.todoItems).eq(0).should('contain.text', 'alert test')
  })

  it('should handle unicode and emoji characters', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.edgeCases.unicode)
      todoPage.verifyTodoCount(1)
      todoPage.verifyTodoTextContains(0, todos.edgeCases.unicode)
    })
  })

  it('should handle rapid successive additions', () => {
    const items = ['Rapid 1', 'Rapid 2', 'Rapid 3', 'Rapid 4', 'Rapid 5']
    todoPage.addMultipleTodos(items)
    todoPage.verifyTodoCount(5)
    items.forEach((text, index) => {
      todoPage.verifyTodoText(index, text)
    })
  })
})
