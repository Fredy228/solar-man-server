const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const sendEmailRouter = require("./routes/sendEmailRoute");
const usersRouter = require("./routes/usersRoute");
const portfolioRouter = require("./routes/portfolioRoute");
const storeSetsRouter = require("./routes/storeSetsRoutes");
const storeComponentsRouter = require("./routes/storeComponentsRoutes");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use("/api", express.static("static"));

app.use("/api/phone-send", sendEmailRouter);
app.use("/api/admin", usersRouter);
app.use("/api/admin/portfolio", portfolioRouter);
app.use("/api/admin/store-sets", storeSetsRouter);
app.use("/api/admin/store-components", storeComponentsRouter);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
