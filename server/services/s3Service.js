const {
    S3Client,
    CreateBucketCommand
} = require("@aws-sdk/client-s3");

const crypto = require("crypto");


const s3Client = new S3Client({
    region: process.env.AWS_REGION
});


const createDeploymentBucket = async () => {

    // S3 bucket names must be globally unique
    const bucketName =
        `clouddeploy-${crypto.randomBytes(6).toString("hex")}`;

    try {

        console.log(
            "Creating S3 bucket:",
            bucketName
        );

        const command =
            new CreateBucketCommand({
                Bucket: bucketName,

                CreateBucketConfiguration: {
                    LocationConstraint:
                        process.env.AWS_REGION
                }
            });

        await s3Client.send(command);

        console.log(
            "S3 bucket created successfully!"
        );

        return bucketName;

    } catch (error) {

        console.error(
            "S3 bucket creation failed:"
        );

        console.error(
            error.message
        );

        throw error;
    }
};


module.exports = {
    createDeploymentBucket
};