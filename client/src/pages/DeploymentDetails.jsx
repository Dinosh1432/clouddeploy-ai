import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function DeploymentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [deployment, setDeployment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDeployment = async () => {
            try {
                const response = await api.get(
                    `/deployment/${id}`
                );

                setDeployment(
                    response.data.deployment
                );

            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load deployment"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDeployment();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Loading deployment...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Error</h2>
                <p>{error}</p>

                <button
                    onClick={() =>
                        navigate("/deployments")
                    }
                >
                    ← Back to Deployments
                </button>
            </div>
        );
    }

    if (!deployment) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Deployment not found</h2>

                <button
                    onClick={() =>
                        navigate("/deployments")
                    }
                >
                    ← Back to Deployments
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "900px"
            }}
        >
            <button
                onClick={() =>
                    navigate("/deployments")
                }
                style={{
                    padding: "8px 15px",
                    cursor: "pointer"
                }}
            >
                ← Back to Deployments
            </button>

            <h1 style={{ marginTop: "20px" }}>
                Deployment Details
            </h1>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    marginTop: "20px"
                }}
            >
                <h2>
                    {deployment.project?.name ||
                        "Unknown Project"}
                </h2>

                <p>
                    <strong>Status:</strong>{" "}
                    {deployment.status === "success"
                        ? "✅ Success"
                        : deployment.status === "failed"
                        ? "❌ Failed"
                        : `⏳ ${deployment.status}`}
                </p>

                <p>
                    <strong>Created:</strong>{" "}
                    {new Date(
                        deployment.createdAt
                    ).toLocaleString()}
                </p>
            </div>

            {deployment.frontend && (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        marginTop: "20px"
                    }}
                >
                    <h2>Frontend</h2>

                    {deployment.frontend.bucketName && (
                        <p>
                            <strong>S3 Bucket:</strong>{" "}
                            {deployment.frontend.bucketName}
                        </p>
                    )}

                    {deployment.frontend.websiteUrl && (
                        <p>
                            <strong>Application:</strong>{" "}
                            <a
                                href={
                                    deployment.frontend
                                        .websiteUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open Application
                            </a>
                        </p>
                    )}

                    {deployment.frontend.apiUrl && (
                        <p>
                            <strong>API URL:</strong>{" "}
                            {deployment.frontend.apiUrl}
                        </p>
                    )}
                </div>
            )}

            {deployment.backend && (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        marginTop: "20px"
                    }}
                >
                    <h2>Backend</h2>

                    <p>
                        <strong>Status:</strong>{" "}
                        {deployment.backend.status ||
                            "Not Required"}
                    </p>

                    {deployment.backend.port && (
                        <p>
                            <strong>Port:</strong>{" "}
                            {deployment.backend.port}
                        </p>
                    )}

                    {deployment.backend.httpStatus && (
                        <p>
                            <strong>HTTP Status:</strong>{" "}
                            {deployment.backend.httpStatus}
                        </p>
                    )}

                    {deployment.backend.apiUrl && (
                        <p>
                            <strong>API URL:</strong>{" "}
                            {deployment.backend.apiUrl}
                        </p>
                    )}
                </div>
            )}

            {deployment.logs?.length > 0 && (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        marginTop: "20px"
                    }}
                >
                    <h2>Deployment Logs</h2>

                    <div
                        style={{
                            background: "#111",
                            color: "#fff",
                            padding: "15px",
                            borderRadius: "8px",
                            fontFamily: "monospace"
                        }}
                    >
                        {deployment.logs.map(
                            (log, index) => (
                                <p
                                    key={index}
                                    style={{
                                        margin: "8px 0"
                                    }}
                                >
                                    {index + 1}. {log}
                                </p>
                            )
                        )}
                    </div>
                </div>
            )}

            {deployment.error && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        border: "1px solid #ddd",
                        borderRadius: "10px"
                    }}
                >
                    <h2>Deployment Error</h2>
                    <p>{deployment.error}</p>
                </div>
            )}
        </div>
    );
}

export default DeploymentDetails;