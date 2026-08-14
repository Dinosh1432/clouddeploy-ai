const {
    cloneRepository
} = require("./services/repositoryCloner");

const {
    analyzeRepository
} = require("./services/repositoryAnalyzer");


const repositoryUrl =
    "https://github.com/Dinosh1432/clouddeploy-ai";


const runPipeline = async () => {

    try {

        // 1. Clone repository
        console.log("STEP 1: Cloning repository...");

        const repositoryPath =
            await cloneRepository(repositoryUrl);

        console.log(
            "Repository cloned to:"
        );

        console.log(repositoryPath);


        // 2. Analyze repository
        console.log(
            "\nSTEP 2: Analyzing repository..."
        );

        const analysis =
            analyzeRepository(repositoryPath);


        // 3. Display result
        console.log(
            "\nSTEP 3: Repository Analysis"
        );

        console.log(
            JSON.stringify(
                analysis,
                null,
                2
            )
        );


    } catch (error) {

        console.error(
            "\nPipeline failed:"
        );

        console.error(
            error.message
        );
    }
};


runPipeline();