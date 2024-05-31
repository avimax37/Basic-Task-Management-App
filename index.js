const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
app.use(express.json());
const port = process.env.PORT;
app.use(cors());
app.use("/api/v1", require("./routes/taskManagementAPI"));

app.listen(port, () => {
  console.log(
    `Task Management Application started and listening on port ${port}`
  );
});