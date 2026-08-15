const generateDeploymentConfig = (analysis) => {

    const config = {
        type: "unknown",
        frontend: null,
        backend: null
    };


    // --------------------------------
    // Frontend configuration
    // --------------------------------

    if (analysis.frontend) {

        const frontend =
            analysis.frontend;

        if (
            frontend.framework === "React + Vite"
        ) {

            config.frontend = {
                folder: frontend.folder,
                framework: "React + Vite",
                installCommand: "npm install",
                buildCommand: "npm run build",
                outputDirectory: "dist"
            };
        }

        else if (
            frontend.framework === "React"
        ) {

            config.frontend = {
                folder: frontend.folder,
                framework: "React",
                installCommand: "npm install",
                buildCommand: "npm run build",
                outputDirectory: "build"
            };
        }
    }


    // --------------------------------
    // Backend configuration
    // --------------------------------

    if (analysis.backend) {

        const backend =
            analysis.backend;

        if (
            backend.framework === "Express"
        ) {

            config.backend = {
                folder: backend.folder,
                framework: "Express",
                runtime: "Node.js",
                installCommand: "npm install",
                startCommand:
                    backend.startCommand ||
                    "node server.js"
            };
        }
    }


    // --------------------------------
    // Determine deployment type
    // --------------------------------

    if (
        config.frontend &&
        config.backend
    ) {

        config.type =
            "full-stack";

    } else if (
        config.frontend
    ) {

        config.type =
            "frontend";

    } else if (
        config.backend
    ) {

        config.type =
            "backend";
    }


    return config;
};


module.exports = {
    generateDeploymentConfig
};