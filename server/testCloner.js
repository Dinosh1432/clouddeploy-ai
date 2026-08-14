const {
    cloneRepository
} = require("./services/repositoryCloner");

const repositoryUrl =
    "https://github.com/Dinosh1432/clouddeploy-ai";

const test = async () => {

    try {

        const repositoryPath =
            await cloneRepository(repositoryUrl);

        console.log(
            "Repository path:"
        );

        console.log(repositoryPath);

    } catch (error) {

        console.error(
            "Clone failed:"
        );

        console.error(error.message);
    }
};

test();