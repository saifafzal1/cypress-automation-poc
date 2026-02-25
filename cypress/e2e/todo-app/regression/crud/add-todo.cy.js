import todoPage from '../../../../pages/TodoPage'

describe('Regression — Add Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
  })

  it('should display placeholder text in the input', () => {
    todoPage.verifyInputPlaceholder('What needs to be done?')
  })

  it('should add a todo on Enter key press', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.singleTodo)
      todoPage.verifyTodoCount(1)
      todoPage.verifyTodoText(0, todos.singleTodo)
    })
  })

  it('should preserve insertion order', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todos.multipleTodos.forEach((text, index) => {
        todoPage.verifyTodoText(index, text)
      })
    })
  })

  it('should show footer and toggle-all when todos exist', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.singleTodo)
      todoPage.verifyFooterVisible()
      todoPage.verifyToggleAllVisible()
    })
  })
})
