import { useEffect, useState } from "react";
import api from "../services/api";

function Deployments() {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openLogs, setOpenLogs] = useState(null);
    const [retryingId, setRetryingId] = useState(null);

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const response = await api.get("/deployment");

                setDeployments(
                    response.data.deployments || []
                );
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load deployments"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDeployments();
    }, []);

    const toggleLogs = (deploymentId) => {
        setOpenLogs(
            openLogs === deploymentId
                ? null
                : deploymentId
        );
    };

    const retryDeployment = async (projectId, deploymentId) => {
        if (!projectId) {
            alert("Project information is missing.");
            return;
        }

        try {
            setRetryingId(deploymentId);

            await api.post("/deployment/deploy", {
                projectId
            });

            alert("Deployment started successfully.");

            window.location.reload();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Retry deployment failed"
            );
        } finally {
            setRetryingId(null);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    background: "#f8fafc"
                }}
            >
                <h2>Loading deployments...</h2>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "30px",
                maxWidth: "1100px",
                margin: "0 auto",
                background: "#f8fafc"
            }}
        >
            <h1
                style={{
                    marginBottom: "8px"
                }}
            >
                Deployments
            </h1>

            <p
                style={{
                    color: "#64748b",
                    marginTop: 0
                }}
            >
                View and manage your application deployments
            </p>

            {error && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "10px",
                        background: "#fee2e2",
                        color: "#991b1b"
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}

            {!error && deployments.length === 0 && (
                <div
                    style={{
                        marginTop: "25px",
                        padding: "30px",
                        background: "#fff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center"
                    }}
                >
                    <h3>No deployments found</h3>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        Deploy a project to see its deployment history here.
                    </p>
                </div>
            )}

            {deployments.map((deployment) => (
                <div
                    key={deployment._id}
                    style={{
                        marginTop: "20px",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "24px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "20px"
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0
                                }}
                            >
                                {deployment.project?.name ||
                                    "Unknown Project"}
                            </h2>

                            <p
                                style={{
                                    marginTop: "8px",
                                    marginBottom: 0,
                                    color: "#64748b"
                                }}
                            >
                                Deployed on{" "}
                                {new Date(
                                    deployment.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>

                        <div
                            style={{
                                padding: "8px 14px",
                                borderRadius: "20px",
                                fontWeight: "600",
                                background:
                                    deployment.status ===
                                    "success"
                                        ? "#dcfce7"
                                        : deployment.status ===
                                          "failed"
                                        ? "#fee2e2"
                                        : "#fef3c7",
                                color:
                                    deployment.status ===
                                    "success"
                                        ? "#166534"
                                        : deployment.status ===
                                          "failed"
                                        ? "#991b1b"
                                        : "#92400e"
                            }}
                        >
                            {deployment.status === "success"
                                ? "✅ Success"
                                : deployment.status === "failed"
                                ? "❌ Failed"
                                : `⏳ ${deployment.status}`}
                        </div>
                    </div>

                    {/* Frontend */}
                    {deployment.frontend && (
                        <div
                            style={{
                                marginTop: "22px",
                                padding: "18px",
                                borderRadius: "10px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0"
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0
                                }}
                            >
                                Frontend
                            </h3>

                            {deployment.frontend.bucketName && (
                                <p>
                                    <strong>S3 Bucket:</strong>{" "}
                                    {
                                        deployment.frontend
                                            .bucketName
                                    }
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
                                    {
                                        deployment.frontend
                                            .apiUrl
                                    }
                                </p>
                            )}
                        </div>
                    )}

                    {/* Backend */}
                    <div
                        style={{
                            marginTop: "18px",
                            padding: "18px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                        }}
                    >
                        <h3
                            style={{
                                marginTop: 0
                            }}
                        >
                            Backend
                        </h3>

                        {deployment.backend?.status ? (
                            <>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    {
                                        deployment.backend
                                            .status
                                    }
                                </p>

                                {deployment.backend.port && (
                                    <p>
                                        <strong>Port:</strong>{" "}
                                        {
                                            deployment.backend
                                                .port
                                        }
                                    </p>
                                )}

                                {deployment.backend.httpStatus && (
                                    <p>
                                        <strong>HTTP Status:</strong>{" "}
                                        {
                                            deployment.backend
                                                .httpStatus
                                        }
                                    </p>
                                )}

                                {deployment.backend.apiUrl && (
                                    <p>
                                        <strong>API URL:</strong>{" "}
                                        {
                                            deployment.backend
                                                .apiUrl
                                        }
                                    </p>
                                )}
                            </>
                        ) : (
                            <p
                                style={{
                                    color: "#64748b"
                                }}
                            >
                                Backend not required for this project.
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {deployment.error && (
                        <div
                            style={{
                                marginTop: "18px",
                                padding: "15px",
                                borderRadius: "10px",
                                background: "#fee2e2",
                                color: "#991b1b"
                            }}
                        >
                            <strong>Deployment Error:</strong>{" "}
                            {deployment.error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px",
                            flexWrap: "wrap"
                        }}
                    >
                        <button
                            onClick={() =>
                                (window.location.href =
                                    `/deployments/${deployment._id}`)
                            }
                            style={{
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background: "#2563eb",
                                color: "#fff",
                                fontWeight: "600"
                            }}
                        >
                            View Details
                        </button>

                        <button
                            onClick={() =>
                                toggleLogs(deployment._id)
                            }
                            style={{
                                padding: "10px 18px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background: "#fff",
                                fontWeight: "600"
                            }}
                        >
                            {openLogs === deployment._id
                                ? "Hide Logs"
                                : "View Logs"}
                        </button>

                        {deployment.status === "failed" && (
                            <button
                                onClick={() =>
                                    retryDeployment(
                                        deployment.project?._id,
                                        deployment._id
                                    )
                                }
                                disabled={
                                    retryingId ===
                                    deployment._id
                                }
                                style={{
                                    padding: "10px 18px",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor:
                                        retryingId ===
                                        deployment._id
                                            ? "not-allowed"
                                            : "pointer",
                                    background: "#dc2626",
                                    color: "#fff",
                                    fontWeight: "600",
                                    opacity:
                                        retryingId ===
                                        deployment._id
                                            ? 0.7
                                            : 1
                                }}
                            >
                                {retryingId === deployment._id
                                    ? "Retrying..."
                                    : "Retry Deployment"}
                            </button>
                        )}
                    </div>

                    {/* Logs */}
                    {openLogs === deployment._id && (
                        <div
                            style={{
                                marginTop: "18px",
                                padding: "18px",
                                borderRadius: "10px",
                                background: "#0f172a",
                                color: "#e2e8f0",
                                fontFamily:
                                    "Consolas, monospace"
                            }}
                        >
                            <h3
                                style={{
                                    color: "#fff",
                                    marginTop: 0
                                }}
                            >
                                Deployment Logs
                            </h3>

                            {deployment.logs?.length > 0 ? (
                                deployment.logs.map(
                                    (log, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding:
                                                    "7px 0",
                                                borderBottom:
                                                    "1px solid #334155"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#22c55e",
                                                    marginRight:
                                                        "8px"
                                                }}
                                            >
                                                ✓
                                            </span>

                                            {log}
                                        </div>
                                    )
                                )
                            ) : (
                                <p>
                                    No logs available.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Deployments;