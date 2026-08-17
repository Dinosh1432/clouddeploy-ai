require("dotenv").config();

const path = require("path");

const {
    deployFrontend
} = require("./services/deploymentService");


const test = async () => {

    try {

        const repositoryPath =
            path.join(
                __dirname,
                ".."
            );

        console.log(
            "Repository:",
            repositoryPath
        );

        const result =
            await deployFrontend(
                repositoryPath
            );

        console.log(
            "\nDeployment Result:"
        );

        console.log(result);

    } catch (error) {

        console.error(
            "\nDeployment test failed:"
        );

        console.error(
            error.message
        );
    }
};


test();