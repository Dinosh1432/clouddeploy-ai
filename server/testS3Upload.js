require("dotenv").config();

const path = require("path");

const {
    uploadDirectory
} = require("./services/s3Uploader");


const bucketName =
    "clouddeploy-e2530682e5a9";


const distDirectory =
    path.join(
        __dirname,
        "..",
        "client",
        "dist"
    );


const test = async () => {

    try {

        console.log(
            "Uploading frontend..."
        );

        console.log(
            "Source:",
            distDirectory
        );

        console.log(
            "Bucket:",
            bucketName
        );

        await uploadDirectory(
            distDirectory,
            bucketName
        );

    } catch (error) {

        console.error(
            "S3 upload failed:"
        );

        console.error(
            error.message
        );
    }
};


test();