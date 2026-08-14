const fs = require("fs");
const path = require("path");


// Analyze a Node.js package.json
const analyzePackageJson = (projectPath) => {

    const packageJsonPath = path.join(
        projectPath,
        "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }

    const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf-8")
    );

    const files = fs.readdirSync(projectPath);

    const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
    };


    // Detect framework
    let framework = "unknown";

    if (dependencies.react) {
        framework = "React";
    }

    if (dependencies.vite) {
        framework =
            framework === "React"
                ? "React + Vite"
                : "Vite";
    }

    if (dependencies.express) {
        framework = "Express";
    }


    // Detect package manager
    let packageManager = null;

    if (files.includes("package-lock.json")) {
        packageManager = "npm";
    } else if (files.includes("yarn.lock")) {
        packageManager = "yarn";
    } else if (files.includes("pnpm-lock.yaml")) {
        packageManager = "pnpm";
    }


    return {
        projectType: "Node.js",
        framework,
        packageManager,
        buildCommand:
            packageJson.scripts?.build || null,
        startCommand:
            packageJson.scripts?.start || null
    };
};


// Analyze complete repository
const analyzeRepository = (repositoryPath) => {

    const files = fs.readdirSync(repositoryPath);

    let frontend = null;
    let backend = null;


    // --------------------------------
    // Check root package.json
    // --------------------------------

    const rootAnalysis =
        analyzePackageJson(repositoryPath);

    if (rootAnalysis) {

        return {
            structure: "root",

            frontend: null,

            backend: rootAnalysis
        };
    }


    // --------------------------------
    // Detect frontend
    // --------------------------------

    const frontendFolders = [
        "client",
        "frontend",
        "web"
    ];

    for (const folder of frontendFolders) {

        const frontendPath =
            path.join(repositoryPath, folder);

        if (
            fs.existsSync(frontendPath) &&
            fs.statSync(frontendPath).isDirectory()
        ) {

            const analysis =
                analyzePackageJson(frontendPath);

            if (analysis) {

                frontend = {
                    folder,
                    ...analysis
                };

                break;
            }
        }
    }


    // --------------------------------
    // Detect backend
    // --------------------------------

    const backendFolders = [
        "server",
        "backend",
        "api"
    ];

    for (const folder of backendFolders) {

        const backendPath =
            path.join(repositoryPath, folder);

        if (
            fs.existsSync(backendPath) &&
            fs.statSync(backendPath).isDirectory()
        ) {

            const analysis =
                analyzePackageJson(backendPath);

            if (analysis) {

                backend = {
                    folder,
                    ...analysis
                };

                break;
            }
        }
    }


    // --------------------------------
    // Python detection
    // --------------------------------

    if (!frontend && !backend) {

        if (
            files.includes("requirements.txt") ||
            files.includes("pyproject.toml")
        ) {

            let framework = "unknown";

            if (files.includes("manage.py")) {
                framework = "Django";
            } else if (files.includes("app.py")) {
                framework = "Flask";
            }

            return {
                structure: "root",

                frontend: null,

                backend: {
                    folder: null,
                    projectType: "Python",
                    framework,
                    packageManager: "pip",
                    buildCommand: null,
                    startCommand: null
                }
            };
        }
    }


    // --------------------------------
    // Final result
    // --------------------------------

    if (frontend || backend) {

        return {
            structure:
                frontend && backend
                    ? "frontend-backend"
                    : "single-project",

            frontend,

            backend
        };
    }


    // Nothing detected
    return {
        structure: "unknown",
        frontend: null,
        backend: null
    };
};


module.exports = {
    analyzeRepository
};