import todoPage from '../../../pages/TodoPage'

describe('Smoke — Add Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
  })

  it('should add a single todo', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.singleTodo)
      todoPage.verifyTodoCount(1)
      todoPage.verifyTodoText(0, todos.singleTodo)
    })
  })

  it('should add multiple todos', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
      todoPage.verifyTodoCount(3)
      todos.multipleTodos.forEach((text, index) => {
        todoPage.verifyTodoText(index, text)
      })
    })
  })

  it('should clear input after adding a todo', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.singleTodo)
      todoPage.verifyInputEmpty()
    })
  })

  it('should update items-left count when adding todos', () => {
    cy.fixture('todos').then((todos) => {
      todoPage.addTodo(todos.multipleTodos[0])
      todoPage.verifyItemsLeft(1)
      todoPage.addTodo(todos.multipleTodos[1])
      todoPage.verifyItemsLeft(2)
      todoPage.addTodo(todos.multipleTodos[2])
      todoPage.verifyItemsLeft(3)
    })
  })
})
