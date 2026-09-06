import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Deploy() {

    const location = useLocation();
    const navigate = useNavigate();

    const project = location.state?.project;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleDeploy = async () => {

        if (!project?._id) {
            setError("No project selected.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {

            const response = await api.post(
                "/deployment/deploy",
                {
                    projectId: project._id
                }
            );

            setResult(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Deployment failed"
            );

        } finally {

            setLoading(false);
        }
    };


    if (!project) {

        return (
            <div style={{ padding: "30px" }}>

                <h1>Deploy Application</h1>

                <p>
                    No project selected.
                </p>

                <button
                    onClick={() => navigate("/projects")}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer"
                    }}
                >
                    ← Go to Projects
                </button>

            </div>
        );
    }


    return (
        <div style={{ padding: "30px" }}>

            <h1>CloudDeploy AI</h1>

            <h2>Deploy Application</h2>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    maxWidth: "700px",
                    marginTop: "20px"
                }}
            >

                <h3>{project.name}</h3>

                <p>
                    {project.description || "No description"}
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
                            {project.github.language || "Not specified"}
                        </p>
                    </>
                )}

                <button
                    onClick={handleDeploy}
                    disabled={loading}
                    style={{
                        marginTop: "15px",
                        padding: "12px 25px",
                        cursor: loading
                            ? "not-allowed"
                            : "pointer"
                    }}
                >
                    {loading
                        ? "Deploying..."
                        : "🚀 Deploy Application"}
                </button>

            </div>


            {error && (
                <div style={{ marginTop: "20px" }}>
                    <strong>Error:</strong> {error}
                </div>
            )}


            {result && (
                <div style={{ marginTop: "30px" }}>

                    <h3>✅ Deployment Successful</h3>

                    <p>
                        {result.message}
                    </p>

                    {result.deployment?.frontend && (
                        <div>

                            <h4>Frontend</h4>

                            <p>
                                Bucket:{" "}
                                {result.deployment.frontend.bucketName}
                            </p>

                            <p>
                                Website:{" "}

                                <a
                                    href={
                                        result.deployment.frontend.websiteUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open Application
                                </a>

                            </p>

                        </div>
                    )}

                    {result.deployment?.backend && (
                        <div>

                            <h4>Backend</h4>

                            <p>
                                Status:{" "}
                                {result.deployment.backend.status}
                            </p>

                            <p>
                                HTTP Status:{" "}
                                {result.deployment.backend.httpStatus}
                            </p>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default Deploy;