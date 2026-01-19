// Responsible for CRUD of todos
class Model {
  // Todos get into localStorage or empty array
  todos = JSON.parse(localStorage.getItem("todos")) || [];

  // Adds new todo and pushes it into the todos array
  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    };

    this.todos.push(todo);
  }

  // Updates the text of specific todo that has specific id with the editedText and left status the same
  editTodo(id, editedText) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: editedText, complete: todo.complete }
        : todo,
    );
  }

  // Filters a todo and deletes it by id
  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  // Flips the complete boolean value on the specified todo
  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: todo.text, complete: !todo.complete }
        : todo,
    );
  }
}

// Responsible for visual representation
class View {
  constructor() {
    this.app = this.getElement("#root");

    this.form = this.createElement("form", "form");

    this.input = this.createElement("input", "formInput");
    this.input.type = "text";
    this.input.placeholder = "Task name";
    this.input.name = "todo";

    this.submitButton = this.createElement("button", "submitButton");
    this.submitButton.textContent = "Add";

    this.todoList = this.createElement("ul", "list");

    this.form.append(this.input, this.submitButton);
    this.app.append(this.form, this.todoList);
  }

  get todoText() {
    return this.input.value;
  }

  resetInput() {
    this.input.value = "";
  }

  // Creates an element with an optional CSS class
  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) {
      element.classList.add(className);
    }

    return element;
  }

  // Allows to get an element or elements by a selector
  getElement(selector) {
    return document.querySelector(selector);
  }

  // Draws todos according to the model.todos
  displayTodos(todos) {
    // Clean all of them first
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    // Creates a todo with a checkbox, editable field and "Delete" button
    todos.forEach((todo) => {
      const li = this.createElement("li", "item");
      li.id = todo.id;

      const checkbox = this.createElement("input", "checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = todo.complete;

      const div = this.createElement("div", "input");
      div.contentEditable = true;
      div.dataset.input = "";

      if (todo.complete) {
        const strike = this.createElement("strike");
        strike.textContent = todo.text;
        div.append(strike);
      } else {
        div.textContent = todo.text;
      }

      const deleteButton = this.createElement("button", "deleteButton");
      deleteButton.dataset.delete = "";
      deleteButton.textContent = "Delete";

      li.append(checkbox, div, deleteButton);

      this.todoList.append(li);
    });
  }
}

// Responsible for binding the Model and the View and for handling user actions
class Controller {
  #_temporaryTodoText = "";

  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Draw all available todos in the beginning
    this.view.displayTodos(this.model.todos);

    // Handle user actions
    this.view.form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (this.view.todoText) {
        this.model.addTodo(this.view.todoText);
        this.view.resetInput();
        this.onTodoListChanged();
      }
    });

    this.view.todoList.addEventListener("input", (e) => {
      if (e.target.hasAttribute("data-input")) {
        this.#_temporaryTodoText = e.target.textContent;
      }
    });

    this.view.todoList.addEventListener("focusout", (e) => {
      if (e.target.hasAttribute("data-input") && this.#_temporaryTodoText) {
        const id = parseInt(e.target.parentElement.id);
        this.model.editTodo(id, this.#_temporaryTodoText);
        this.onTodoListChanged();
        this.#_temporaryTodoText = "";
      }
    });

    this.view.todoList.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-delete")) {
        const id = parseInt(e.target.parentElement.id);
        this.model.deleteTodo(id);
        this.onTodoListChanged();
      }
    });

    this.view.todoList.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const id = parseInt(e.target.parentElement.id);
        this.model.toggleTodo(id);
        this.onTodoListChanged();
      }
    });
  }

  // Draw all available todos and then save them into localStorage
  onTodoListChanged() {
    this.view.displayTodos(this.model.todos);
    localStorage.setItem("todos", JSON.stringify(this.model.todos));
  }
}

const app = new Controller(new Model(), new View());
