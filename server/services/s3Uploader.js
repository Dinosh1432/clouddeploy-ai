const fs = require("fs");
const path = require("path");

const {
    S3Client,
    PutObjectCommand
} = require("@aws-sdk/client-s3");


const s3Client = new S3Client({
    region: process.env.AWS_REGION
});


const getContentType = (filePath) => {

    const extension =
        path.extname(filePath).toLowerCase();

    const contentTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".webp": "image/webp"
    };

    return (
        contentTypes[extension] ||
        "application/octet-stream"
    );
};


const getFiles = (directory) => {

    const entries =
        fs.readdirSync(
            directory,
            { withFileTypes: true }
        );

    let files = [];

    for (const entry of entries) {

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {

            files = files.concat(
                getFiles(fullPath)
            );

        } else {

            files.push(fullPath);
        }
    }

    return files;
};


const uploadDirectory = async (
    directory,
    bucketName
) => {

    const files =
        getFiles(directory);

    console.log(
        `Found ${files.length} files to upload`
    );

    for (const filePath of files) {

        const relativePath =
            path.relative(
                directory,
                filePath
            );

        const key =
            relativePath
                .split(path.sep)
                .join("/");

        const fileContent =
            fs.readFileSync(filePath);

        const command =
            new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: fileContent,
                ContentType:
                    getContentType(filePath)
            });

        await s3Client.send(command);

        console.log(
            `Uploaded: ${key}`
        );
    }

    console.log(
        "All frontend files uploaded successfully!"
    );
};


module.exports = {
    uploadDirectory
};