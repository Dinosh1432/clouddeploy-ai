const Project = require("../models/Project");

// Create a project
const createProject = async (req, res) => {
    try {
        const { name, description, repositoryUrl } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await Project.create({
            name,
            description,
            repositoryUrl,
            owner: req.user.userId
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get logged-in user's projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            projects
        });

    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createProject,
    getProjects
};