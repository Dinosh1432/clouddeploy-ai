const path = require("path");

const {
    uploadDirectory
} = require("./s3Uploader");

const {
    createDeploymentBucket
} = require("./s3Service");

const {
    executeCommand,
    verifyBackend
} = require("./ec2DeploymentService");


const deployFrontend = async (repositoryPath) => {

    try {

        console.log("Starting frontend deployment...");

        const distDirectory = path.join(
            repositoryPath,
            "client",
            "dist"
        );

        const {
            bucketName,
            websiteUrl
        } = await createDeploymentBucket();

        await uploadDirectory(
            distDirectory,
            bucketName
        );

        console.log(
            "Frontend deployment completed!"
        );

        return {
            bucketName,
            websiteUrl
        };

    } catch (error) {

        console.error(
            "Frontend deployment failed:",
            error.message
        );

        throw error;
    }
};


/*
    Deploy backend to EC2
*/
const deployBackend = async () => {

    try {

        console.log(
            "Starting backend deployment..."
        );

        const result = await executeCommand([
            "cd /home/ubuntu/clouddeploy-ai",
            "git pull",
            "cd server",
            "npm install",
            "pm2 restart clouddeploy-backend --update-env || pm2 start server.js --name clouddeploy-backend",
            "pm2 save",
            "pm2 pid clouddeploy-backend"
        ]);
        const verification = await verifyBackend();

        console.log(
            "Backend deployment completed!"
        );

        return {
    ...result,
    verification
    };

    } catch (error) {

        console.error(
            "Backend deployment failed:",
            error.message
        );

        throw error;
    }
};
const deployApplication = async (repositoryPath) => {

    try {

        console.log("================================");
        console.log("Starting full application deployment");
        console.log("================================");

        // 1. Deploy frontend
        const frontendResult =
            await deployFrontend(repositoryPath);

        // 2. Deploy backend
        const backendResult =
            await deployBackend();

        console.log("================================");
        console.log("Full deployment completed");
        console.log("================================");

        return {
            success: true,

            frontend: frontendResult,

            backend: backendResult
        };

    } catch (error) {

        console.error(
            "Full deployment failed:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    deployFrontend,
    deployBackend,
    deployApplication
};