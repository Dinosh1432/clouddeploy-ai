import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get("/projects");

                setProjects(response.data.projects || []);
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
                <p>
                    <strong>Error:</strong> {error}
                </p>
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
                                <strong>Repository:</strong>{" "}
                                {project.github.fullName}
                            </p>

                            <p>
                                <strong>Branch:</strong>{" "}
                                {project.github.defaultBranch}
                            </p>

                            <p>
                                <strong>Language:</strong>{" "}
                                {project.github.language ||
                                    "Not specified"}
                            </p>
                        </>
                    )}

                    <button
                        onClick={() =>
                            handleDeploy(project)
                        }
                        style={{
                            marginTop: "10px",
                            padding: "10px 20px",
                            cursor: "pointer"
                        }}
                    >
                        🚀 Deploy
                    </button>

                </div>
            ))}

        </div>
    );
}

export default Projects;