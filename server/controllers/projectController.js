const Project = require("../models/Project");
const githubService = require("../services/githubService");


// Extract GitHub owner and repository name
const parseGithubUrl = (url) => {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname !== "github.com") {
            return null;
        }

        const parts = parsedUrl.pathname
            .split("/")
            .filter(Boolean);

        if (parts.length < 2) {
            return null;
        }

        return {
            owner: parts[0],
            repo: parts[1].replace(".git", "")
        };

    } catch (error) {
        return null;
    }
};


// Create a project
const createProject = async (req, res) => {
    try {

        const {
            name,
            description,
            repositoryUrl
        } = req.body;


        if (!name) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }


        // GitHub information
        let github = null;


        if (repositoryUrl) {

            const githubRepo =
                parseGithubUrl(repositoryUrl);


            if (!githubRepo) {
                return res.status(400).json({
                    message: "Invalid GitHub repository URL"
                });
            }


            try {

                const repository =
                    await githubService.getRepository(
                        githubRepo.owner,
                        githubRepo.repo
                    );


                github = {
                    owner: repository.owner.login,
                    repo: repository.name,
                    fullName: repository.full_name,
                    defaultBranch: repository.default_branch,
                    language: repository.language,
                    private: repository.private
                };


            } catch (error) {

                console.error(
                    "GitHub repository error:",
                    error.message
                );


                if (error.status === 404) {
                    return res.status(404).json({
                        message: "GitHub repository not found"
                    });
                }


                return res.status(500).json({
                    message: "Failed to verify GitHub repository"
                });
            }
        }


        const project = await Project.create({

            name,

            description,

            repositoryUrl,

            github,

            owner: req.user.userId

        });


        res.status(201).json({

            message: "Project created successfully",

            project

        });


    } catch (error) {

        console.error(
            "Create project error:",
            error
        );


        res.status(500).json({
            message: "Server error"
        });
    }
};



// Get logged-in user's projects
const getProjects = async (req, res) => {

    try {

        const projects = await Project.find({

            owner: req.user.userId

        }).sort({

            createdAt: -1

        });


        res.status(200).json({

            projects

        });


    } catch (error) {

        console.error(
            "Get projects error:",
            error
        );


        res.status(500).json({

            message: "Server error"

        });
    }
};


module.exports = {

    createProject,

    getProjects

};