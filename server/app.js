const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const githubRoutes = require("./routes/githubRoutes");
const deploymentRoutes = require("./routes/deploymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/deployment", deploymentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CloudDeploy AI API is running"
    });
});

module.exports = app;