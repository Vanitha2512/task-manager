const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect("mongodb+srv://myUser:vanitha123@cluster0.ptn3hbr.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Task Schema
const TaskSchema = new mongoose.Schema({
  task: String,
  completed: { type: Boolean, default: false },
  category: { type: String, default: "Work" }, // Added category
  priority: { type: String, default: "low" },  // Added priority
  estimatedTime: { type: String, default: "" } // Added estimated time
});

const Task = mongoose.model("Task", TaskSchema);

// Serve static files (if React is in build folder)
app.use(express.static(path.join(__dirname, "build")));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Task Manager API!");
});

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Error fetching tasks");
  }
});

// POST new task
app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = new Task({
      task: req.body.task,
      category: req.body.category || "Work", // Default category
      priority: req.body.priority || "low",  // Default priority
      estimatedTime: req.body.estimatedTime || ""
    });
    const saved = await newTask.save();
    res.json(saved);
  } catch (err) {
    res.status(500).send("Error adding task");
  }
});

// PUT to toggle task completion
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).send("Error updating task");
  }
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send("Error deleting task");
  }
});

// Catch-all for frontend routes (React build)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Listen on the dynamic port provided by Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
