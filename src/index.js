const express = require("express");
const cors = require("cors");
const moment = require("moment");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUserByUsername(username) {
  const user = users.filter((f) => f.username === username);

  if (!user.length) return false;

  return user[0];
}

function getToDoById(toDoId, todos) {
  const todo = todos.filter((f) => f.id === toDoId);

  if (!todo.length) return false;

  return todo[0];
}

function checksExistsUserAccount(request, response, next) {
  const user = getUserByUsername(request.headers.username);

  if (!user) return response.status(404).json({ error: "user not found" });

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (getUserByUsername(username))
    return response.status(400).json({ error: "this user already exists" });

  const user = { name, username, id: uuidv4(), todos: [] };

  users.push(user);

  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = getUserByUsername(username);

  if (!user) return response.status(404).json({ error: "user not found" });

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const toDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: moment().format(),
  };

  const user = getUserByUsername(username);

  if (!user) return response.status(404).json({ error: "user not found" });

  user.todos.push(toDo);

  return response.status(201).json(toDo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = getUserByUsername(username);

  if (!user) return response.status(404).json({ error: "user not found" });

  const todo = getToDoById(id, user.todos);

  if (!todo) return response.status(404).json({ error: "to do not found" });

  if (title) todo.title = title;

  if (moment(deadline).isValid()) todo.deadline = deadline;

  const updatedToDo = getToDoById(id, user.todos);

  return response.json(updatedToDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = getUserByUsername(username);

  if (!user) return response.status(404).json({ error: "user not found" });

  const todo = getToDoById(id, user.todos);

  if (!todo) return response.status(404).json({ error: "to do not found" });

  todo.done = true;

  const updatedToDo = getToDoById(id, user.todos);

  return response.json(updatedToDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = getUserByUsername(username);

  if (!user) return response.status(404).json({ error: "user not found" });

  const todo = getToDoById(id, user.todos);

  if (!todo) return response.status(404).json({ error: "to do not found" });

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).json({ ok: true });
});

module.exports = app;
