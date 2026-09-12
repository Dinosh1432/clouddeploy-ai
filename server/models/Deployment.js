const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "deploying", "success", "failed"],
            default: "pending"
        },

        frontend: {
            bucketName: {
                type: String
            },

            websiteUrl: {
                type: String
            },

            apiUrl: {
                type: String
            }
        },

        backend: {
            status: {
                type: String
            },

            port: {
                type: Number
            },

            httpStatus: {
                type: String
            },

            apiUrl: {
                type: String
            }
        },
        logs: {
        type: [String],
        default: []
        },


        error: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Deployment", deploymentSchema);