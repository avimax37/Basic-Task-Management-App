const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.use("/api/v1", require("./routes/taskManagementAPI"));

app.listen(port, () => {
  console.log(
    `Task Management Application started and listening on port ${port}`
  );
});
