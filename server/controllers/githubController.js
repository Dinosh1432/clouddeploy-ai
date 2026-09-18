
const Project = require("../models/Project");
const githubService = require("../services/githubService");


// ==========================================
// GET SINGLE GITHUB REPOSITORY
// ==========================================

const getRepository = async (req, res) => {
    try {
        const {
            owner,
            repo
        } = req.params;

        const repository =
            await githubService.getRepository(
                owner,
                repo
            );

        res.json({
            success: true,
            repository
        });

    } catch (error) {
        console.error(
            "GitHub repository error:",
            error.message
        );

        res.status(
            error.status === 404
                ? 404
                : 500
        ).json({
            success: false,
            message:
                error.status === 404
                    ? "GitHub repository not found"
                    : "Failed to fetch GitHub repository"
        });
    }
};


// ==========================================
// GET CONNECTED GITHUB REPOSITORIES
// ==========================================

const getConnectedRepositories = async (
    req,
    res
) => {
    try {

        const projects =
            await Project.find({
                owner: req.user.userId
            }).sort({
                createdAt: -1
            });


        const repositories = projects
            .filter(
                (project) =>
                    project.github
            )
            .map((project) => ({
                projectId:
                    project._id,

                projectName:
                    project.name,

                description:
                    project.description,

                repositoryUrl:
                    project.repositoryUrl,

                owner:
                    project.github.owner,

                repo:
                    project.github.repo,

                fullName:
                    project.github.fullName,

                defaultBranch:
                    project.github.defaultBranch,

                language:
                    project.github.language,

                private:
                    project.github.private
            }));


        res.json({
            success: true,
            repositories
        });

    } catch (error) {

        console.error(
            "Connected GitHub repositories error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load GitHub repositories"
        });
    }
};


module.exports = {
    getRepository,
    getConnectedRepositories
};