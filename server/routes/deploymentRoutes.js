const express = require("express");

const {
    deployApplication
} = require("../services/deploymentService");

const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");

const router = express.Router();

router.post("/deploy", protect, async (req, res) => {

    try {

        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "projectId is required"
            });
        }

        console.log(
            "Deployment requested for project:",
            projectId
        );

        // Find project belonging to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        if (!project.repositoryUrl) {
            return res.status(400).json({
                success: false,
                message: "Project does not have a GitHub repository"
            });
        }

        console.log(
            "GitHub repository:",
            project.repositoryUrl
        );

        const result =
            await deployApplication(project);

        res.json({
            success: true,
            message: "Application deployed successfully",
            deployment: result
        });

    } catch (error) {

        console.error(
            "Deployment route error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Deployment failed",
            error: error.message
        });
    }
});

module.exports = router;