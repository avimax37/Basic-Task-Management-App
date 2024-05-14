const router = require("express").Router();
const pool = require("../db");

//Retrieving a list of all tasks.
router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await pool.query("SELECT * FROM tasks");
    res.json({
      type: "success",
      number_of_tasks: allTasks.rowCount,
      tasks: allTasks.rows,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

//Creating a new task by submitting a title, description, and initial status.
router.post("/tasks/newtask", async (req, res) => {
  const { title, description, status } = req.body;
  if (status === "incomplete" || status === "completed") {
    try {
      const checkDuplicateTask = await pool.query(
        "SELECT id FROM tasks WHERE title=$1",
        [title.trim()]
      );
      if (checkDuplicateTask.rows.length > 0) {
        return res.json("Task already exists!");
      }

      const newTask = await pool.query(
        "INSERT INTO tasks(title,description,status) VALUES ($1, $2, $3) RETURNING id",
        [title, description, status]
      );
      if (newTask.rows.length > 0) {
        res.json("New Task Added!");
      } else {
        res.json("Error");
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error!");
    }
  } else {
    return res.json("Status must be either incomplete or completed");
  }
});

//Fetching a specific task using its ID.
router.get("/tasks/fetch/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
      id,
    ]);
    if (checkTaskId.rows.length === 0) {
      return res.json("Task does not exist!");
    }
    const fetchById = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    res.json(fetchById.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

//Updating the status of a task by its ID.
router.put("/tasks/update/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status === "incomplete" || status === "completed") {
    try {
      const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
        id,
      ]);
      if (checkTaskId.rows.length === 0) {
        return res.json("Task does not exist!");
      }
      const updateById = await pool.query(
        "UPDATE tasks SET status=$1 WHERE id=$2",
        [status, id]
      );
      res.json("Task status updated successfully!");
    } catch (error) {
      console.log(error.messgae);
      res.status(500).send("Internal Server Error!");
    }
  } else {
    return res.json("Status must be either incomplete or completed");
  }
});

//Deleting a task based on its ID.
router.delete("/tasks/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
      id,
    ]);
    if (checkTaskId.rows.length === 0) {
      return res.json("Task does not exist!");
    }
    const deleteById = await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json("Task deleted successfully!");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

module.exports = router;
