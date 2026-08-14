const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        repositoryUrl: {
            type: String,
            trim: true
        },

        // GitHub repository information
        github: {
            owner: {
                type: String,
                trim: true
            },

            repo: {
                type: String,
                trim: true
            },

            fullName: {
                type: String,
                trim: true
            },

            defaultBranch: {
                type: String,
                trim: true
            },

            language: {
                type: String,
                trim: true
            },

            private: {
                type: Boolean,
                default: false
            }
        },

        status: {
            type: String,
            default: "created"
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);