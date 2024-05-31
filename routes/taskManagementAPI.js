const router = require("express").Router();
const pool = require("../db");

const { checkSchema, validationResult } = require("express-validator");

//taskSchema
const taskSchema = checkSchema({
  title: {
    custom: {
      errorMessage: "Task already exists",
      options: async (title) => {
        const checkDuplicateTask = await pool.query(
          "SELECT id FROM tasks WHERE title=$1",
          [title.trim()]
        );
        if (checkDuplicateTask.rows.length > 0) {
          throw new Error("Task already exists!");
        }
        return true;
      },
    },
  },
  status: {
    isIn: {
      options: [["incomplete", "completed"]],
      errorMessage: "Status must be either incomplete or completed",
    },
  },
});

//updateSchema
const updateSchema = checkSchema({
  status: {
    isIn: {
      options: [["incomplete", "completed"]],
      errorMessage: "Status must be either incomplete or completed",
    },
  },
});

//Retrieving a list of all tasks.
router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
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
router.post("/tasks/newtask", taskSchema, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  const { title, description, status } = req.body;
  try {
    // if (status === "incomplete" || status === "completed") {
    // const checkDuplicateTask = await pool.query(
    //   "SELECT id FROM tasks WHERE title=$1",
    //   [title.trim()]
    // );
    // if (checkDuplicateTask.rows.length > 0) {
    //   return res.json("Task already exists!");
    // }

    const newTask = await pool.query(
      "INSERT INTO tasks(title,description,status) VALUES ($1, $2, $3) RETURNING id",
      [title, description, status]
    );
    if (newTask.rows.length > 0) {
      res.json("New Task Added!");
    } else {
      res.json("Error");
    }
    // } else {
    //   return res.json("Status must be either incomplete or completed");
    // }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

//checkTaskSchema
const checkTaskSchema = checkSchema({
  id: {
    errorMessage: "Invalid task ID",
    custom: {
      options: async (id) => {
        const checkTaskId = await pool.query(
          "SELECT * FROM tasks WHERE id=$1",
          [id]
        );
        if (checkTaskId.rows.length === 0) {
          throw new Error("Task does not exist!");
        }
      },
    },
  },
});

//Fetching a specific task using its ID.
router.get("/tasks/fetch/:id", checkTaskSchema, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const { id } = req.params;
  try {
    // const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
    //   id,
    // ]);
    // if (checkTaskId.rows.length === 0) {
    //   return res.json("Task does not exist!");
    // }
    const fetchById = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    res.json(fetchById.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

//Updating the status of a task by its ID.
router.put("/tasks/update/:id", updateSchema, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { status } = req.body;
  try {
    // if (status === "incomplete" || status === "completed") {
    const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
      id,
    ]);
    if (checkTaskId.rows.length === 0) {
      return res.json("Task does not exist!");
    }
    const currentTaskStatus = checkTaskId.rows[0].status;
    if (
      (status === "incomplete" && currentTaskStatus === "completed") ||
      (status === "completed" && currentTaskStatus === "incomplete")
    ) {
      const updateById = await pool.query(
        "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING status, id",
        [status, id]
      );
      res.json(`Task: ${id} status updated successfully!`);
    } else {
      return res.json(`Task: ${id} status is already ${status}!`);
    }
    // } else {
    //   return res.json("Status must be either incomplete or completed");
    // }
  } catch (error) {
    console.log(error.messgae);
    res.status(500).send("Internal Server Error!");
  }
});

//Deleting a task based on its ID.
router.delete("/tasks/delete/:id", checkTaskSchema, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  const { id } = req.params;
  try {
    // const checkTaskId = await pool.query("SELECT * FROM tasks WHERE id=$1", [
    //   id,
    // ]);
    // if (checkTaskId.rows.length === 0) {
    //   return res.json("Task does not exist!");
    // }
    const deleteById = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING id",
      [id]
    );
    res.json(`Task: ${id} deleted successfully!`);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

module.exports = router;
