require("dotenv").config();

const {
    createDeploymentBucket
} = require("./services/s3Service");


const test = async () => {

    try {

        const bucketName =
            await createDeploymentBucket();

        console.log(
            "Deployment bucket:",
            bucketName
        );

    } catch (error) {

        console.error(
            "S3 test failed:",
            error.message
        );
    }
};


test();