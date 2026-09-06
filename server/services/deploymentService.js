const path = require("path");
const fs = require("fs");
const os = require("os");

const simpleGit = require("simple-git");

const {
    uploadDirectory
} = require("./s3Uploader");

const {
    createDeploymentBucket
} = require("./s3Service");

const {
    executeCommand,
    verifyBackend,
    deployBackend: deployBackendToEC2
} = require("./ec2DeploymentService");


/*
    Clone GitHub repository
*/
const createProjectSlug = (projectName) => {
    return projectName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};


const getProjectApiUrl = (projectName) => {

    const projectSlug =
        createProjectSlug(projectName);

    return `http://3.111.169.23/${projectSlug}/api`;
};

const cloneRepository = async (repositoryUrl) => {

    const tempDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "clouddeploy-")
    );

    console.log(
        "Temporary directory:",
        tempDirectory
    );

    const git = simpleGit();

    console.log(
        "Cloning repository:",
        repositoryUrl
    );

    await git.clone(
        repositoryUrl,
        tempDirectory
    );

    console.log(
        "Repository cloned successfully"
    );

    return tempDirectory;
};


/*
    Build frontend
*/

const buildFrontend = async (
    repositoryPath,
    project
) => {

    const clientDirectory = path.join(
        repositoryPath,
        "client"
    );

    const rootPackageJson = path.join(
        repositoryPath,
        "package.json"
    );

    const clientPackageJson = path.join(
        clientDirectory,
        "package.json"
    );

    const clientIndexHtml = path.join(
        clientDirectory,
        "index.html"
    );

    const rootIndexHtml = path.join(
        repositoryPath,
        "index.html"
    );


    // ==============================================
    // API URL
    // ==============================================

    const apiUrl =
        getProjectApiUrl(project.name);

    console.log(
        "Frontend API URL:",
        apiUrl
    );


    // ==============================================
    // CASE 1
    // React / Vite frontend inside client/
    // ==============================================

    if (fs.existsSync(clientPackageJson)) {

        console.log(
            "Detected frontend inside client directory"
        );

        console.log(
            "Installing frontend dependencies..."
        );

        await executeLocalCommand(
            "npm install",
            clientDirectory
        );


        console.log(
            "Building frontend..."
        );

        console.log(
            "Injecting VITE_API_URL:",
            apiUrl
        );


        await executeLocalCommand(
            `set "VITE_API_URL=${apiUrl}" && npm run build`,
            clientDirectory
        );


        const distDirectory =
            path.join(
                clientDirectory,
                "dist"
            );


        if (!fs.existsSync(distDirectory)) {

            throw new Error(
                "Frontend build completed but dist directory was not found"
            );
        }


        console.log(
            "Frontend build completed successfully"
        );


        return distDirectory;
    }


    // ==============================================
    // CASE 2
    // Frontend at repository root
    // ==============================================

    if (fs.existsSync(rootPackageJson)) {

        console.log(
            "Detected frontend at repository root"
        );


        console.log(
            "Installing frontend dependencies..."
        );


        await executeLocalCommand(
            "npm install",
            repositoryPath
        );


        console.log(
            "Building frontend..."
        );


        console.log(
            "Injecting VITE_API_URL:",
            apiUrl
        );


        await executeLocalCommand(
            `set "VITE_API_URL=${apiUrl}" && npm run build`,
            repositoryPath
        );


        const distDirectory =
            path.join(
                repositoryPath,
                "dist"
            );


        if (!fs.existsSync(distDirectory)) {

            throw new Error(
                "Frontend build completed but dist directory was not found"
            );
        }


        console.log(
            "Frontend build completed successfully"
        );


        return distDirectory;
    }


    // ==============================================
    // CASE 3
    // Static HTML inside client/
    // ==============================================

    if (fs.existsSync(clientIndexHtml)) {

        console.log(
            "Detected static frontend inside client directory"
        );

        return clientDirectory;
    }


    // ==============================================
    // CASE 4
    // Static HTML at repository root
    // ==============================================

    if (fs.existsSync(rootIndexHtml)) {

        console.log(
            "Detected static frontend at repository root"
        );

        return repositoryPath;
    }


    throw new Error(
        "Unable to detect frontend. No package.json or index.html found."
    );
};

/*
    Execute local Windows command
*/
const executeLocalCommand = (command, cwd) => {

    return new Promise((resolve, reject) => {

        const { exec } = require("child_process");

        exec(
            command,
            {
                cwd,
                maxBuffer: 1024 * 1024 * 10
            },
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "Command failed:",
                        command
                    );

                    console.error(stderr);

                    return reject(error);
                }

                console.log(stdout);

                resolve(stdout);
            }
        );
    });
};


/*
    Deploy frontend to S3
*/
const deployFrontend = async (
    repositoryPath,
    project
) => {

    try {

        console.log(
            "Starting frontend deployment..."
        );


        const apiUrl =
            getProjectApiUrl(project.name);


        console.log(
            "Project API URL:",
            apiUrl
        );


        const distDirectory =
            await buildFrontend(
                repositoryPath,
                project
            );


        const {
            bucketName,
            websiteUrl
        } = await createDeploymentBucket();


        await uploadDirectory(
            distDirectory,
            bucketName
        );


        console.log(
            "Frontend deployment completed!"
        );


        return {
            bucketName,
            websiteUrl,
            apiUrl
        };

    } catch (error) {

        console.error(
            "Frontend deployment failed:",
            error.message
        );

        throw error;
    }
};


/*
    Deploy backend to EC2
*/
/*
    Deploy backend to EC2
*/
/*
    Deploy backend to EC2
*/
const deployBackend = async (repositoryPath, project) => {

    try {

        console.log(
            "Checking backend for selected project..."
        );

        const serverDirectory =
            path.join(repositoryPath, "server");

        const serverPackageJson =
            path.join(serverDirectory, "package.json");


        if (!fs.existsSync(serverPackageJson)) {

            console.log(
                "No backend detected in selected project"
            );

            return {
                status: "Not Required",
                message:
                    "This project does not contain a backend"
            };
        }


        console.log(
            "Backend detected in selected project"
        );


        const projectName =
            project.name
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-");


        console.log(
            "Project name:",
            projectName
        );


        // Deploy backend to EC2
        const deploymentResult =
            await deployBackendToEC2(
                project.repositoryUrl,
                projectName
            );


        // Verify backend using the actual deployed port
        const verification =
            await verifyBackend(deploymentResult.port);


        console.log(
            "Backend verification successful"
        );


        return {

            status: "Deployed",

            message:
                "Backend deployed successfully",

            commandId:
                deploymentResult.commandId,

            port:
                deploymentResult.port,

            httpStatus:
                verification.statusCode,

            verified:
                verification.verified

        };

    } catch (error) {

        console.error(
            "Backend deployment failed:",
            error.message
        );

        throw error;
    }
};
const deployApplication = async (project) => {

    let repositoryPath = null;

    try {

        console.log("================================");
        console.log("Starting full application deployment");
        console.log("================================");

        console.log(
            "Project:",
            project.name
        );

        console.log(
            "Repository:",
            project.repositoryUrl
        );


        /*
            1. Clone GitHub repository
        */

        repositoryPath =
            await cloneRepository(
                project.repositoryUrl
            );


        /*
            2. Build and deploy frontend
        */

        const frontendResult =
        await deployFrontend(
        repositoryPath,
        project
    );


        /*
            3. Deploy backend
        */

        const backendResult =
        await deployBackend(repositoryPath, project);


        console.log("================================");
        console.log("Full deployment completed");
        console.log("================================");


        return {

            success: true,

            project: {
                id: project._id,
                name: project.name
            },

            frontend: frontendResult,

            backend: backendResult
        };

    } catch (error) {

        console.error(
            "Full deployment failed:",
            error.message
        );

        throw error;

    } finally {

        /*
            Delete temporary cloned repository
        */

        if (repositoryPath) {

            try {

                fs.rmSync(
                    repositoryPath,
                    {
                        recursive: true,
                        force: true
                    }
                );

                console.log(
                    "Temporary repository deleted"
                );

            } catch (cleanupError) {

                console.error(
                    "Cleanup failed:",
                    cleanupError.message
                );
            }
        }
    }
};


module.exports = {

    deployFrontend,

    deployBackend,

    deployApplication

};