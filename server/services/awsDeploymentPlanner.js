const createDeploymentPlan = (deploymentConfig) => {

    const plan = {
        deploymentType: deploymentConfig.type,
        resources: [],
        steps: []
    };


    // --------------------------------
    // Frontend
    // --------------------------------

    if (deploymentConfig.frontend) {

        plan.resources.push({
            type: "S3",
            purpose: "Frontend hosting",
            folder: deploymentConfig.frontend.folder
        });

        plan.steps.push({
            order: plan.steps.length + 1,
            action: "build-frontend",
            command: deploymentConfig.frontend.buildCommand
        });

        plan.steps.push({
            order: plan.steps.length + 1,
            action: "upload-frontend-to-s3",
            bucket: "deployment-bucket"
        });
    }


    // --------------------------------
    // Backend
    // --------------------------------

    if (deploymentConfig.backend) {

        plan.resources.push({
            type: "EC2",
            purpose: "Backend hosting",
            folder: deploymentConfig.backend.folder
        });

        plan.resources.push({
            type: "SecurityGroup",
            purpose: "Allow backend HTTP traffic"
        });

        plan.steps.push({
            order: plan.steps.length + 1,
            action: "install-backend-dependencies",
            command: deploymentConfig.backend.installCommand
        });

        plan.steps.push({
            order: plan.steps.length + 1,
            action: "start-backend",
            command: deploymentConfig.backend.startCommand
        });
    }


    return plan;
};


module.exports = {
    createDeploymentPlan
};