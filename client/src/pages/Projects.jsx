import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get("/projects");

                setProjects(
                    response.data.projects || []
                );
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load projects"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDeploy = (project) => {
        navigate("/deploy", {
            state: {
                project
            }
        });
    };

    const handleProjectDeployments = (project) => {
        navigate(
            `/deployments?projectId=${project._id}`
        );
    };

    const handleDelete = async (project) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(project._id);
            setError("");

            await api.delete(
                `/projects/${project._id}`
            );

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (item) =>
                        item._id !== project._id
                )
            );

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete project"
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Loading projects...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>Projects</h1>

            {error && (
                <div
                    style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        maxWidth: "700px"
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}

            {projects.length === 0 && !error && (
                <p>No projects found.</p>
            )}

            {projects.map((project) => (
                <div
                    key={project._id}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        marginTop: "20px",
                        maxWidth: "700px"
                    }}
                >
                    <h2>{project.name}</h2>

                    <p>
                        {project.description ||
                            "No description"}
                    </p>

                    {project.github && (
                        <>
                            <p>
                                <strong>
                                    Repository:
                                </strong>{" "}
                                {project.github.fullName}
                            </p>

                            <p>
                                <strong>
                                    Branch:
                                </strong>{" "}
                                {project.github.defaultBranch}
                            </p>

                            <p>
                                <strong>
                                    Language:
                                </strong>{" "}
                                {project.github.language ||
                                    "Not specified"}
                            </p>
                        </>
                    )}

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "15px",
                            flexWrap: "wrap"
                        }}
                    >
                        {/* Deploy */}
                        <button
                            onClick={() =>
                                handleDeploy(project)
                            }
                            style={{
                                padding: "10px 20px",
                                cursor: "pointer"
                            }}
                        >
                            🚀 Deploy
                        </button>

                        {/* Project Deployments */}
                        <button
                            onClick={() =>
                                handleProjectDeployments(
                                    project
                                )
                            }
                            style={{
                                padding: "10px 20px",
                                cursor: "pointer",
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px"
                            }}
                        >
                            📋 Deployments
                        </button>

                        {/* Delete */}
                        <button
                            onClick={() =>
                                handleDelete(project)
                            }
                            disabled={
                                deletingId ===
                                project._id
                            }
                            style={{
                                padding: "10px 20px",
                                cursor:
                                    deletingId ===
                                    project._id
                                        ? "not-allowed"
                                        : "pointer",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                opacity:
                                    deletingId ===
                                    project._id
                                        ? 0.6
                                        : 1
                            }}
                        >
                            {deletingId === project._id
                                ? "Deleting..."
                                : "🗑 Delete"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Projects;