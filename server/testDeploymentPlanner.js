const {
    cloneRepository
} = require("./services/repositoryCloner");

const {
    analyzeRepository
} = require("./services/repositoryAnalyzer");

const {
    generateDeploymentConfig
} = require("./services/deploymentConfigGenerator");

const {
    createDeploymentPlan
} = require("./services/awsDeploymentPlanner");


const repositoryUrl =
    "https://github.com/Dinosh1432/clouddeploy-ai";


const run = async () => {

    try {

        console.log(
            "STEP 1: Cloning repository..."
        );

        const repositoryPath =
            await cloneRepository(
                repositoryUrl
            );


        console.log(
            "\nSTEP 2: Analyzing repository..."
        );

        const analysis =
            analyzeRepository(
                repositoryPath
            );


        console.log(
            "\nSTEP 3: Generating deployment configuration..."
        );

        const deploymentConfig =
            generateDeploymentConfig(
                analysis
            );


        console.log(
            "\nSTEP 4: Creating AWS deployment plan..."
        );

        const deploymentPlan =
            createDeploymentPlan(
                deploymentConfig
            );


        console.log(
            "\nAWS Deployment Plan:"
        );

        console.log(
            JSON.stringify(
                deploymentPlan,
                null,
                2
            )
        );


    } catch (error) {

        console.error(
            "Deployment planning failed:"
        );

        console.error(
            error.message
        );
    }
};


run();