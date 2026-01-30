const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createTodo,
  getTodosByBoard,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");

// todos inside board
router.post("/boards/:boardId/todos", protect, createTodo);
router.get("/boards/:boardId/todos", protect, getTodosByBoard);

// individual todo operations
router.put("/todos/:id", protect, updateTodo);
router.delete("/todos/:id", protect, deleteTodo);

module.exports = router;
