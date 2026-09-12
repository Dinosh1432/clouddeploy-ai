import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Deploy() {
    const location = useLocation();
    const navigate = useNavigate();

    const project = location.state?.project;

    const [loading, setLoading] = useState(false);
    const [deploymentStatus, setDeploymentStatus] =
        useState("");
    const [deploymentId, setDeploymentId] =
        useState(null);
    const [deploymentLogs, setDeploymentLogs] =
        useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const pollingRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const checkDeploymentStatus = async (id) => {
        try {
            const response = await api.get(
                `/deployment/${id}/status`
            );

            const deployment =
                response.data.deployment;

            setDeploymentLogs(
                deployment.logs || []
            );

            if (
                deployment.status === "deploying" ||
                deployment.status === "pending"
            ) {
                setDeploymentStatus(
                    "⏳ Deployment in progress..."
                );
                return;
            }

            if (deployment.status === "success") {
                stopPolling();

                setLoading(false);
                setDeploymentStatus(
                    "✅ Deployment completed successfully."
                );

                // Get complete deployment details
                const detailsResponse =
                    await api.get(
                        `/deployment/${id}`
                    );

                setResult(
                    detailsResponse.data
                );

                return;
            }

            if (deployment.status === "failed") {
                stopPolling();

                setLoading(false);

                setDeploymentStatus(
                    "❌ Deployment failed."
                );

                setError(
                    deployment.error ||
                    "Deployment failed"
                );

                return;
            }

        } catch (err) {
            console.error(
                "Status polling error:",
                err
            );

            stopPolling();

            setLoading(false);

            setError(
                err.response?.data?.message ||
                "Failed to check deployment status"
            );
        }
    };

    const startPolling = (id) => {
        // Check immediately
        checkDeploymentStatus(id);

        // Then every 2 seconds
        pollingRef.current =
            setInterval(() => {
                checkDeploymentStatus(id);
            }, 2000);
    };

    const handleDeploy = async () => {
        if (!project?._id) {
            setError("No project selected.");
            return;
        }

        stopPolling();

        setLoading(true);
        setError("");
        setResult(null);
        setDeploymentId(null);
        setDeploymentLogs([]);
        setDeploymentStatus(
            "⏳ Starting deployment..."
        );

        try {
            const response = await api.post(
                "/deployment/deploy",
                {
                    projectId: project._id
                }
            );

            const id =
                response.data.deploymentId;

            if (!id) {
                throw new Error(
                    "Deployment ID was not returned"
                );
            }

            setDeploymentId(id);

            setDeploymentStatus(
                "⏳ Deployment started. Waiting for completion..."
            );

            startPolling(id);

        } catch (err) {
            console.error(err);

            setLoading(false);

            setDeploymentStatus(
                "❌ Deployment failed to start."
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Deployment failed"
            );
        }
    };

    if (!project) {
        return (
            <div style={{ padding: "30px" }}>
                <h1>Deploy Application</h1>

                <p>No project selected.</p>

                <button
                    onClick={() =>
                        navigate("/projects")
                    }
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
        <div
            style={{
                padding: "30px",
                maxWidth: "900px",
                margin: "0 auto"
            }}
        >
            <h1>Deploy Application</h1>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "24px",
                    marginTop: "20px"
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
                    onClick={handleDeploy}
                    disabled={loading}
                    style={{
                        marginTop: "15px",
                        padding: "12px 25px",
                        cursor: loading
                            ? "not-allowed"
                            : "pointer",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading
                        ? "⏳ Deploying..."
                        : "🚀 Deploy Application"}
                </button>
            </div>

            {/* Deployment Status */}
            {(loading ||
                deploymentStatus ||
                deploymentId) && (
                <div
                    style={{
                        marginTop: "25px",
                        padding: "24px",
                        border: "1px solid #ddd",
                        borderRadius: "12px"
                    }}
                >
                    <h2>Deployment Status</h2>

                    <p
                        style={{
                            fontSize: "18px",
                            fontWeight: "600"
                        }}
                    >
                        {deploymentStatus}
                    </p>

                    {deploymentId && (
                        <p
                            style={{
                                color: "#666"
                            }}
                        >
                            Deployment ID:{" "}
                            {deploymentId}
                        </p>
                    )}

                    {loading && (
                        <p
                            style={{
                                color: "#666"
                            }}
                        >
                            Please wait while your
                            application is being deployed.
                        </p>
                    )}

                    {/* Live Logs */}
                    {deploymentLogs.length > 0 && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "18px",
                                background: "#0f172a",
                                color: "#fff",
                                borderRadius: "10px",
                                fontFamily:
                                    "Consolas, monospace"
                            }}
                        >
                            <h3>
                                Deployment Progress
                            </h3>

                            {deploymentLogs.map(
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
                                                color:
                                                    "#22c55e",
                                                marginRight:
                                                    "8px"
                                            }}
                                        >
                                            ✓
                                        </span>

                                        {log}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "16px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        borderRadius: "10px"
                    }}
                >
                    <strong>Error:</strong>{" "}
                    {error}
                </div>
            )}

            {/* Success Result */}
            {result &&
                result.deployment &&
                !loading && (
                    <div
                        style={{
                            marginTop: "25px",
                            padding: "24px",
                            border: "1px solid #bbf7d0",
                            background: "#f0fdf4",
                            borderRadius: "12px"
                        }}
                    >
                        <h2>
                            ✅ Deployment Successful
                        </h2>

                        {result.deployment.frontend
                            ?.websiteUrl && (
                            <p>
                                <strong>
                                    Application:
                                </strong>{" "}
                                <a
                                    href={
                                        result.deployment
                                            .frontend
                                            .websiteUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open Application
                                </a>
                            </p>
                        )}

                        {result.deployment.backend
                            ?.status && (
                            <p>
                                <strong>
                                    Backend:
                                </strong>{" "}
                                {
                                    result.deployment
                                        .backend
                                        .status
                                }
                            </p>
                        )}
                    </div>
                )}
        </div>
    );
}

export default Deploy;