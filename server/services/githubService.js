const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const getRepository = async (owner, repo) => {
    const response = await octokit.rest.repos.get({
        owner,
        repo
    });

    return response.data;
};

module.exports = {
    getRepository
};