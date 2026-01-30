const Todo = require("../models/Todo");
const Board = require("../models/Board");

// create
const createTodo = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Todo title is required" });
    }

    const board = await Board.findOne({
      _id: boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const todo = await Todo.create({
      title: title.trim(),
      description: description || "",
      boardId,
      userId: req.user.userId,
    });

    return res.status(201).json(todo);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getTodosByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findOne({
      _id: boardId,
      userId: req.user.userId,
    });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const todos = await Todo.find({ boardId, userId: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(todos);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// update
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// delete
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Todo.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createTodo, getTodosByBoard, updateTodo, deleteTodo };
