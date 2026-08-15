const {
    cloneRepository
} = require("./services/repositoryCloner");

const {
    analyzeRepository
} = require("./services/repositoryAnalyzer");

const {
    generateDeploymentConfig
} = require("./services/deploymentConfigGenerator");


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
            "\nDeployment Configuration:"
        );

        console.log(
            JSON.stringify(
                deploymentConfig,
                null,
                2
            )
        );

    } catch (error) {

        console.error(
            "Deployment configuration failed:"
        );

        console.error(
            error.message
        );
    }
};


run();