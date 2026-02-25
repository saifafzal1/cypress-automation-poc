import BasePage from './BasePage'

class TodoPage extends BasePage {
  // ── URL ──
  url = 'https://todomvc.com/examples/react/dist/'

  // ── Selectors ──
  newTodoInput = '.new-todo'
  todoList = '.todo-list'
  todoItems = '.todo-list li'
  toggleCheckbox = '.toggle'
  destroyButton = '.destroy'
  editInput = '#todo-input'
  todoLabel = '[data-testid="todo-item-label"]'
  filters = '.filters'
  filterAll = '.filters a[href="#/"]'
  filterActive = '.filters a[href="#/active"]'
  filterCompleted = '.filters a[href="#/completed"]'
  clearCompletedButton = '.clear-completed'
  toggleAllCheckbox = '.toggle-all'
  todoCount = '.todo-count'
  footer = '.footer'

  // ── Navigation ──
  visitApp() {
    cy.visit(this.url)
  }

  // ── CRUD ──
  addTodo(text) {
    cy.get(this.newTodoInput).type(`${text}{enter}`)
  }

  addMultipleTodos(items) {
    items.forEach((item) => this.addTodo(item))
  }

  editTodo(index, newText) {
    cy.get(this.todoItems).eq(index).find('label').dblclick()
    cy.get(this.todoItems).eq(index).find(this.editInput)
      .should('be.visible')
      .clear()
      .type(`${newText}{enter}`)
  }

  editTodoWithBlur(index, newText) {
    cy.get(this.todoItems).eq(index).find('label').dblclick()
    cy.get(this.todoItems).eq(index).find(this.editInput)
      .should('be.visible')
      .clear()
      .type(newText)
      .blur()
  }

  editTodoWithEscape(index, newText) {
    cy.get(this.todoItems).eq(index).find('label').dblclick()
    cy.get(this.todoItems).eq(index).find(this.editInput)
      .should('be.visible')
      .clear()
      .type(`${newText}{esc}`)
  }

  editTodoToClear(index) {
    cy.get(this.todoItems).eq(index).find('label').dblclick()
    cy.get(this.todoItems).eq(index).find(this.editInput)
      .should('be.visible')
      .clear()
      .type('{enter}')
  }

  deleteTodo(index) {
    cy.get(this.todoItems).eq(index).find(this.destroyButton).click({ force: true })
  }

  // ── Toggle ──
  toggleTodo(index) {
    cy.get(this.todoItems).eq(index).find(this.toggleCheckbox).check({ force: true })
  }

  untoggleTodo(index) {
    cy.get(this.todoItems).eq(index).find(this.toggleCheckbox).uncheck({ force: true })
  }

  toggleAll() {
    cy.get(this.toggleAllCheckbox).check({ force: true })
  }

  untoggleAll() {
    cy.get(this.toggleAllCheckbox).uncheck({ force: true })
  }

  // ── Filtering ──
  filterByAll() {
    cy.get(this.filterAll).click()
  }

  filterByActive() {
    cy.get(this.filterActive).click()
  }

  filterByCompleted() {
    cy.get(this.filterCompleted).click()
  }

  // ── Bulk ──
  clearCompleted() {
    cy.get(this.clearCompletedButton).click()
  }

  // ── Verification ──
  verifyTodoCount(count) {
    cy.get(this.todoItems).should('have.length', count)
  }

  verifyTodoText(index, text) {
    cy.get(this.todoItems).eq(index).find('label').first()
      .invoke('text').should('eq', text)
  }

  verifyTodoTextContains(index, text) {
    cy.get(this.todoItems).eq(index).should('contain.text', text)
  }

  verifyItemsLeft(count) {
    const label = count === 1 ? 'item left' : 'items left'
    cy.get(this.todoCount).should('contain.text', `${count} ${label}`)
  }

  verifyTodoCompleted(index) {
    cy.get(this.todoItems).eq(index).should('have.class', 'completed')
  }

  verifyTodoNotCompleted(index) {
    cy.get(this.todoItems).eq(index).should('not.have.class', 'completed')
  }

  verifyInputPlaceholder(text) {
    cy.get(this.newTodoInput).should('have.attr', 'placeholder', text)
  }

  verifyInputEmpty() {
    cy.get(this.newTodoInput).should('have.value', '')
  }

  verifyFooterVisible() {
    cy.get(this.footer).should('be.visible')
  }

  verifyFooterNotExist() {
    cy.get(this.footer).should('not.exist')
  }

  verifyToggleAllVisible() {
    cy.get(this.toggleAllCheckbox).should('exist')
  }

  verifyClearCompletedVisible() {
    cy.get(this.clearCompletedButton).should('be.visible')
  }

  verifyClearCompletedNotExist() {
    cy.get(this.clearCompletedButton).should('not.exist')
  }

  verifyFilterSelected(filter) {
    cy.get(this.filters).find('.selected').should('contain.text', filter)
  }

  verifyTodoNotExist(text) {
    cy.get(this.todoList).should('not.contain.text', text)
  }

  verifyTodoExists(text) {
    cy.get(this.todoList).should('contain.text', text)
  }

  verifyNoTodos() {
    cy.get(this.todoItems).should('have.length', 0)
  }
}

export default new TodoPage()
