import todoPage from '../../../pages/TodoPage'

describe('Smoke — Complete Todo', () => {
  beforeEach(() => {
    todoPage.visitApp()
    cy.fixture('todos').then((todos) => {
      todoPage.addMultipleTodos(todos.multipleTodos)
    })
  })

  it('should mark a todo as complete', () => {
    todoPage.toggleTodo(0)
    todoPage.verifyTodoCompleted(0)
  })

  it('should update items-left when completing a todo', () => {
    todoPage.verifyItemsLeft(3)
    todoPage.toggleTodo(0)
    todoPage.verifyItemsLeft(2)
  })

  it('should uncomplete a completed todo', () => {
    todoPage.toggleTodo(0)
    todoPage.verifyTodoCompleted(0)
    todoPage.untoggleTodo(0)
    todoPage.verifyTodoNotCompleted(0)
    todoPage.verifyItemsLeft(3)
  })
})
