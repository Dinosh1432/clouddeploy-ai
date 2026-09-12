const express = require("express");

const {
    deployApplication
} = require("../services/deploymentService");

const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");
const Deployment = require("../models/Deployment");

const router = express.Router();


// ==========================================
// GET ALL DEPLOYMENTS
// ==========================================

router.get("/", protect, async (req, res) => {
    try {
        const deployments = await Deployment.find({
            owner: req.user.userId
        })
            .populate(
                "project",
                "name description repositoryUrl"
            )
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            deployments
        });

    } catch (error) {
        console.error(
            "Fetch deployments error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch deployments"
        });
    }
});


// ==========================================
// GET DEPLOYMENT STATUS
// ==========================================

router.get("/:id/status", protect, async (req, res) => {
    try {
        const deployment = await Deployment.findOne({
            _id: req.params.id,
            owner: req.user.userId
        }).select(
            "status logs error createdAt updatedAt"
        );

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        res.json({
            success: true,
            deployment
        });

    } catch (error) {
        console.error(
            "Fetch deployment status error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch deployment status"
        });
    }
});


// ==========================================
// GET SINGLE DEPLOYMENT
// ==========================================

router.get("/:id", protect, async (req, res) => {
    try {
        const deployment = await Deployment.findOne({
            _id: req.params.id,
            owner: req.user.userId
        }).populate(
            "project",
            "name description repositoryUrl"
        );

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        res.json({
            success: true,
            deployment
        });

    } catch (error) {
        console.error(
            "Fetch deployment details error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch deployment details"
        });
    }
});


// ==========================================
// START DEPLOYMENT
// ==========================================

router.post("/deploy", protect, async (req, res) => {
    let deploymentRecord = null;

    try {
        const { projectId } = req.body;

        // ------------------------------------------
        // Validate projectId
        // ------------------------------------------

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


        // ------------------------------------------
        // Find project
        // ------------------------------------------

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


        // ------------------------------------------
        // Check repository
        // ------------------------------------------

        if (!project.repositoryUrl) {
            return res.status(400).json({
                success: false,
                message:
                    "Project does not have a GitHub repository"
            });
        }


        // ------------------------------------------
        // Create deployment record immediately
        // ------------------------------------------

        deploymentRecord = await Deployment.create({
            project: project._id,
            owner: req.user.userId,
            status: "deploying",
            logs: [
                "Deployment started"
            ]
        });

        console.log(
            "Deployment record created:",
            deploymentRecord._id
        );


        // ------------------------------------------
        // Return immediately
        // ------------------------------------------

        res.status(202).json({
            success: true,
            message:
                "Deployment started successfully",
            deploymentId:
                deploymentRecord._id
        });


        // ==========================================
        // RUN DEPLOYMENT IN BACKGROUND
        // ==========================================

        (async () => {
            try {

                console.log(
                    "Starting background deployment:",
                    deploymentRecord._id
                );

                console.log(
                    "GitHub repository:",
                    project.repositoryUrl
                );


                // --------------------------------------
                // Actual deployment
                // --------------------------------------

                const result =
                    await deployApplication(project);


                // --------------------------------------
                // Success
                // --------------------------------------

                deploymentRecord.status =
                    "success";


                // --------------------------------------
                // Dynamic logs
                // --------------------------------------

                const deploymentLogs = [
                    "Deployment started",
                    "GitHub repository cloned",
                    "Frontend deployed to S3"
                ];


                if (
                    result.backend &&
                    result.backend.status === "Deployed"
                ) {

                    deploymentLogs.push(
                        "Backend deployed to EC2",
                        "PM2 process started",
                        "Nginx configured",
                        "Backend verification successful"
                    );

                } else {

                    deploymentLogs.push(
                        "Backend not required"
                    );
                }


                deploymentLogs.push(
                    "Deployment completed successfully"
                );


                deploymentRecord.logs =
                    deploymentLogs;


                // --------------------------------------
                // Frontend details
                // --------------------------------------

                if (result.frontend) {

                    deploymentRecord.frontend = {
                        bucketName:
                            result.frontend.bucketName,

                        websiteUrl:
                            result.frontend.websiteUrl,

                        apiUrl:
                            result.frontend.apiUrl
                    };
                }


                // --------------------------------------
                // Backend details
                // --------------------------------------

                if (result.backend) {

                    deploymentRecord.backend = {
                        status:
                            result.backend.status,

                        port:
                            result.backend.port,

                        httpStatus:
                            result.backend.httpStatus,

                        apiUrl:
                            result.backend.nginx?.apiUrl
                    };
                }


                await deploymentRecord.save();


                console.log(
                    "Deployment completed successfully:",
                    deploymentRecord._id
                );


            } catch (error) {

                // --------------------------------------
                // Deployment failed
                // --------------------------------------

                console.error(
                    "Background deployment failed:",
                    error.message
                );


                deploymentRecord.status =
                    "failed";


                deploymentRecord.logs = [
                    "Deployment started",
                    "Deployment failed"
                ];


                deploymentRecord.error =
                    error.message;


                await deploymentRecord.save();


                console.log(
                    "Failed deployment record updated:",
                    deploymentRecord._id
                );
            }
        })();

    } catch (error) {

        console.error(
            "Deployment start error:",
            error.message
        );

        // Only send an error if the response hasn't
        // already been sent.
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message:
                    "Failed to start deployment",
                error: error.message
            });
        }
    }
});


module.exports = router;