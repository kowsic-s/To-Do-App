const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Todo
router.post("/", auth, async (req, res) => {
  const { text, title, description, date } = req.body;
  try {
    // Use 'text' if provided (from frontend), otherwise use 'title'
    const todoText = text || title;
    const todo = new Todo({
      user: req.user,
      text: todoText,
      date: date ? new Date(date) : new Date(),
    });
    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Todos
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user });
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update a Todo
router.put("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { text: req.body.text },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a Todo
router.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/done", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.completed = !todo.completed;
    await todo.save();

    res.json(todo);
  } catch (err) {
    console.error("Error updating todo status:", err);
    res.status(500).json({ error: err.message });
  }
});

// Download Day-wise (CSV Example)
router.get("/download", auth, async (req, res) => {
  const { date } = req.query;
  try {
    const todos = await Todo.find({
      user: req.user,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });

    let csv = "Title,Description,Status,Date\n";
    todos.forEach((t) => {
      csv += `${t.text || ""},${t.description || ""},${
        t.completed ? "Completed" : "Pending"
      },${t.date.toISOString()}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`todos-${date}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Error downloading todos:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
