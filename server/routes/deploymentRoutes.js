const express = require("express");

const {
    deployApplication
} = require("../services/deploymentService");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/deploy", protect, async (req, res) => {

    try {

        const { repositoryPath } = req.body;

        if (!repositoryPath) {
            return res.status(400).json({
                success: false,
                message: "repositoryPath is required"
            });
        }

        console.log(
            "Deployment requested for:",
            repositoryPath
        );

        const result =
            await deployApplication(repositoryPath);

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