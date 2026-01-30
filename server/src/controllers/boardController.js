const Board = require("../models/Board");

//create board
const createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Board name is required" });
    }
    const board = await Board.create({
      userId: req.user.userId,
      name: name.trim(),
    });
    return res.status(201).json({ board });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating board" });
  }
};

//geting all boards

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ boards });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//update board
const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Board name is required" });
    }

    const board = await Board.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name: name.trim() },
      { new: true },
    );

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    return res.status(200).json(board);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//delete board

const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    return res.status(200).json({ message: "Board deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { createBoard, getBoards, updateBoard, deleteBoard };
