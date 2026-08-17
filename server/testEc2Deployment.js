require("dotenv").config();

const {
    executeCommand
} = require("./services/ec2DeploymentService");


const test = async () => {

    try {

        const result =
            await executeCommand([
                "echo CloudDeploy-EC2-Service-Working"
            ]);


        console.log(
            "\nEC2 Deployment Service Result:"
        );

        console.log(result);

    } catch (error) {

        console.error(
            "\nEC2 deployment test failed:"
        );

        console.error(
            error.message
        );
    }
};


test();