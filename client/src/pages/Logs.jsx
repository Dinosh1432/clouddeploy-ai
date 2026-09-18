import { useEffect, useState } from "react";
import api from "../services/api";

function Logs() {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get("/deployment");

                setDeployments(
                    response.data.deployments || []
                );
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load logs"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const filteredDeployments =
        filter === "all"
            ? deployments
            : deployments.filter(
                  (deployment) =>
                      deployment.status === filter
              );

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Loading logs...</h2>
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
            <h1>Logs</h1>

            <p style={{ color: "#64748b" }}>
                View deployment activity and execution logs.
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

            {/* Filters */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "25px",
                    flexWrap: "wrap"
                }}
            >
                <button
                    onClick={() => setFilter("all")}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background:
                            filter === "all"
                                ? "#2563eb"
                                : "#fff",
                        color:
                            filter === "all"
                                ? "#fff"
                                : "#000"
                    }}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("success")}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background:
                            filter === "success"
                                ? "#16a34a"
                                : "#fff",
                        color:
                            filter === "success"
                                ? "#fff"
                                : "#000"
                    }}
                >
                    Success
                </button>

                <button
                    onClick={() => setFilter("failed")}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background:
                            filter === "failed"
                                ? "#dc2626"
                                : "#fff",
                        color:
                            filter === "failed"
                                ? "#fff"
                                : "#000"
                    }}
                >
                    Failed
                </button>

                <button
                    onClick={() => setFilter("deploying")}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        cursor: "pointer",
                        background:
                            filter === "deploying"
                                ? "#d97706"
                                : "#fff",
                        color:
                            filter === "deploying"
                                ? "#fff"
                                : "#000"
                    }}
                >
                    Deploying
                </button>
            </div>

            {/* Logs */}

            {filteredDeployments.length === 0 ? (
                <div
                    style={{
                        marginTop: "30px",
                        background: "#fff",
                        padding: "30px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        textAlign: "center"
                    }}
                >
                    <h3>No logs found</h3>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        No deployment activity is available.
                    </p>
                </div>
            ) : (
                filteredDeployments.map(
                    (deployment) => (
                        <div
                            key={deployment._id}
                            style={{
                                marginTop: "20px",
                                background: "#fff",
                                padding: "24px",
                                borderRadius: "14px",
                                border:
                                    "1px solid #e2e8f0"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "flex-start",
                                    gap: "20px"
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            margin: 0
                                        }}
                                    >
                                        {deployment
                                            .project
                                            ?.name ||
                                            "Unknown Project"}
                                    </h2>

                                    <p
                                        style={{
                                            color:
                                                "#64748b",
                                            marginTop:
                                                "8px"
                                        }}
                                    >
                                        {new Date(
                                            deployment.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        padding:
                                            "7px 12px",
                                        borderRadius:
                                            "20px",
                                        fontWeight:
                                            "600",
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
                                    {deployment.status ===
                                    "success"
                                        ? "✅ Success"
                                        : deployment.status ===
                                          "failed"
                                        ? "❌ Failed"
                                        : `⏳ ${deployment.status}`}
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: "20px",
                                    background: "#0f172a",
                                    color: "#e2e8f0",
                                    padding: "18px",
                                    borderRadius:
                                        "10px",
                                    fontFamily:
                                        "Consolas, monospace"
                                }}
                            >
                                {deployment.logs?.length >
                                0 ? (
                                    deployment.logs.map(
                                        (
                                            log,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                style={{
                                                    padding:
                                                        "8px 0",
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
                                    )
                                ) : (
                                    <p>
                                        No logs available.
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                )
            )}
        </div>
    );
}

export default Logs;