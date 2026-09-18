const express = require("express");

const {
    deployApplication
} = require("../services/deploymentService");

const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");
const Deployment = require("../models/Deployment");

const router = express.Router();


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

        const deployment =
            await Deployment.findOne({

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
// GET ALL DEPLOYMENTS
// ==========================================

router.get("/", protect, async (req, res) => {

    try {

        // ------------------------------------------
        // Base filter
        // ------------------------------------------

        const filter = {
            owner: req.user.userId
        };


        // ------------------------------------------
        // Optional project filter
        // ------------------------------------------

        if (req.query.projectId) {

            filter.project =
                req.query.projectId;

        }


        // ------------------------------------------
        // Get deployments
        // ------------------------------------------

        const deployments =
            await Deployment.find(filter)
                .populate(
                    "project",
                    "name description repositoryUrl"
                )
                .sort({
                    createdAt: -1
                });


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

            message:
                "Failed to fetch deployments"

        });

    }

});


// ==========================================
// DEPLOY APPLICATION
// ==========================================
// ==========================================
// DELETE DEPLOYMENT HISTORY
// ==========================================

router.delete("/:id", protect, async (req, res) => {
    try {
        const deployment = await Deployment.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: "Deployment not found"
            });
        }

        await Deployment.deleteOne({
            _id: deployment._id
        });

        res.json({
            success: true,
            message: "Deployment history deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete deployment history error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete deployment history"
        });
    }
});
router.post(
    "/deploy",
    protect,
    async (req, res) => {

        let deploymentRecord = null;


        try {

            const {
                projectId
            } = req.body;


            // ------------------------------------------
            // Validate projectId
            // ------------------------------------------

            if (!projectId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "projectId is required"

                });

            }


            console.log(
                "Deployment requested for project:",
                projectId
            );


            // ------------------------------------------
            // Find project
            // ------------------------------------------

            const project =
                await Project.findOne({

                    _id: projectId,

                    owner: req.user.userId

                });


            if (!project) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Project not found"

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
            // Create deployment record
            // ------------------------------------------

            deploymentRecord =
                await Deployment.create({

                    project:
                        project._id,

                    owner:
                        req.user.userId,

                    status:
                        "deploying",

                    logs: [
                        "Deployment started"
                    ]

                });


            console.log(
                "Deployment record created:",
                deploymentRecord._id
            );


            console.log(
                "GitHub repository:",
                project.repositoryUrl
            );


            // ------------------------------------------
            // Start actual deployment
            // ------------------------------------------

            const result =
                await deployApplication(
                    project
                );


            // ==========================================
            // DEPLOYMENT SUCCESS
            // ==========================================

            deploymentRecord.status =
                "success";


            // ------------------------------------------
            // Dynamic deployment logs
            // ------------------------------------------

            const deploymentLogs = [

                "Deployment started",

                "GitHub repository cloned",

                "Frontend deployed to S3"

            ];


            // ------------------------------------------
            // Backend deployment logs
            // ------------------------------------------

            if (
                result.backend &&
                result.backend.status ===
                    "Deployed"
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


            // ------------------------------------------
            // Final log
            // ------------------------------------------

            deploymentLogs.push(
                "Deployment completed successfully"
            );


            deploymentRecord.logs =
                deploymentLogs;


            // ==========================================
            // FRONTEND DETAILS
            // ==========================================

            if (result.frontend) {

                deploymentRecord.frontend = {

                    bucketName:
                        result.frontend
                            .bucketName,

                    websiteUrl:
                        result.frontend
                            .websiteUrl,

                    apiUrl:
                        result.frontend
                            .apiUrl

                };

            }


            // ==========================================
            // BACKEND DETAILS
            // ==========================================

            if (result.backend) {

                deploymentRecord.backend = {

                    status:
                        result.backend
                            .status,

                    port:
                        result.backend
                            .port,

                    httpStatus:
                        result.backend
                            .httpStatus,

                    apiUrl:
                        result.backend
                            .nginx?.apiUrl

                };

            }


            // ------------------------------------------
            // Save deployment
            // ------------------------------------------

            await deploymentRecord.save();


            console.log(
                "Deployment record updated successfully"
            );


            // ==========================================
            // RESPONSE
            // ==========================================

            res.json({

                success: true,

                message:
                    "Application deployed successfully",

                deployment:
                    result,

                deploymentId:
                    deploymentRecord._id

            });


        } catch (error) {


            console.error(
                "Deployment route error:",
                error.message
            );


            // ==========================================
            // FAILED DEPLOYMENT
            // ==========================================

            if (deploymentRecord) {

                deploymentRecord.status =
                    "failed";


                deploymentRecord.logs = [

                    "Deployment started",

                    "Deployment failed"

                ];


                deploymentRecord.error =
                    error.message;


                await deploymentRecord.save();

            }


            res.status(500).json({

                success: false,

                message:
                    "Deployment failed",

                error:
                    error.message,

                deploymentId:
                    deploymentRecord?._id ||
                    null

            });

        }

    }
);


module.exports = router;