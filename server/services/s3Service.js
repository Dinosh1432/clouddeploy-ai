const crypto = require("crypto");

const {
    S3Client,
    CreateBucketCommand,
    PutBucketWebsiteCommand,
    PutPublicAccessBlockCommand,
    PutBucketPolicyCommand
} = require("@aws-sdk/client-s3");


const s3Client = new S3Client({
    region: process.env.AWS_REGION
});


const createDeploymentBucket = async () => {

    const bucketName =
        `clouddeploy-${crypto.randomBytes(6).toString("hex")}`;

    try {

        console.log(
            "Creating S3 bucket:",
            bucketName
        );


        // --------------------------------
        // 1. Create bucket
        // --------------------------------

        await s3Client.send(
            new CreateBucketCommand({
                Bucket: bucketName,

                CreateBucketConfiguration: {
                    LocationConstraint:
                        process.env.AWS_REGION
                }
            })
        );


        console.log(
            "S3 bucket created successfully"
        );


        // --------------------------------
        // 2. Disable public access blocking
        // --------------------------------

        await s3Client.send(
            new PutPublicAccessBlockCommand({
                Bucket: bucketName,

                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: false,
                    IgnorePublicAcls: false,
                    BlockPublicPolicy: false,
                    RestrictPublicBuckets: false
                }
            })
        );


        console.log(
            "S3 public access configured"
        );


        // --------------------------------
        // 3. Enable static website hosting
        // --------------------------------

        await s3Client.send(
            new PutBucketWebsiteCommand({
                Bucket: bucketName,

                WebsiteConfiguration: {
                    IndexDocument: {
                        Suffix: "index.html"
                    }
                }
            })
        );


        console.log(
            "S3 website hosting enabled"
        );


        // --------------------------------
        // 4. Allow public read access
        // --------------------------------

        const bucketPolicy = {
            Version: "2012-10-17",

            Statement: [
                {
                    Sid: "PublicReadGetObject",

                    Effect: "Allow",

                    Principal: "*",

                    Action: "s3:GetObject",

                    Resource:
                        `arn:aws:s3:::${bucketName}/*`
                }
            ]
        };


        await s3Client.send(
            new PutBucketPolicyCommand({
                Bucket: bucketName,

                Policy:
                    JSON.stringify(bucketPolicy)
            })
        );


        console.log(
            "S3 bucket policy configured"
        );


        // --------------------------------
        // 5. Website URL
        // --------------------------------

        const region =
            process.env.AWS_REGION;


        const websiteUrl =
            `http://${bucketName}.s3-website.${region}.amazonaws.com`;


        console.log(
            "S3 website URL:",
            websiteUrl
        );


        return {
            bucketName,
            websiteUrl
        };


    } catch (error) {

        console.error(
            "S3 deployment setup failed:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    createDeploymentBucket
};