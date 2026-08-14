const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const os = require("os");

const cloneRepository = async (repositoryUrl) => {

    const tempDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "clouddeploy-")
    );

    try {

        console.log("Cloning repository...");
        console.log("Repository:", repositoryUrl);
        console.log("Target:", tempDirectory);

        const git = simpleGit();

        await git.clone(
            repositoryUrl,
            tempDirectory
        );

        // Verify that files actually exist
        const files = fs.readdirSync(
            tempDirectory
        );

        console.log(
            "Files after cloning:",
            files
        );

        if (files.length === 0) {
            throw new Error(
                "Repository cloned but directory is empty"
            );
        }

        console.log(
            "Repository cloned successfully"
        );

        return tempDirectory;

    } catch (error) {

        console.error(
            "Repository clone error:",
            error.message
        );

        if (fs.existsSync(tempDirectory)) {
            fs.rmSync(tempDirectory, {
                recursive: true,
                force: true
            });
        }

        throw error;
    }
};

module.exports = {
    cloneRepository
};