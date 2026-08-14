const githubService = require("../services/githubService");

const getRepository = async (req, res) => {
    try {
        const { owner, repo } = req.params;

        if (!owner || !repo) {
            return res.status(400).json({
                message: "Owner and repository are required"
            });
        }

        const repository =
            await githubService.getRepository(owner, repo);

        res.status(200).json({
            message: "Repository fetched successfully",
            repository: {
                name: repository.name,
                fullName: repository.full_name,
                description: repository.description,
                url: repository.html_url,
                cloneUrl: repository.clone_url,
                defaultBranch: repository.default_branch,
                language: repository.language,
                private: repository.private
            }
        });

    } catch (error) {
        console.error("GitHub API error:", error.message);

        if (error.status === 404) {
            return res.status(404).json({
                message: "Repository not found"
            });
        }

        res.status(500).json({
            message: "Failed to fetch GitHub repository"
        });
    }
};

module.exports = {
    getRepository
};