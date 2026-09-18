const express = require("express");

const {
    createProject,
    getProjects,
    deleteProject
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create project
router.post(
    "/",
    protect,
    createProject
);


// Get logged-in user's projects
router.get(
    "/",
    protect,
    getProjects
);


// Delete project
router.delete(
    "/:id",
    protect,
    deleteProject
);


module.exports = router;