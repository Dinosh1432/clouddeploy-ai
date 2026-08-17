import { useState } from "react";
import api from "../services/api";

function Deploy() {
    const [repositoryPath, setRepositoryPath] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleDeploy = async () => {
        if (!repositoryPath.trim()) {
            setError("Please enter the repository path.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await api.post("/deployment/deploy", {
                repositoryPath
            });

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

    return (
        <div style={{ padding: "30px" }}>
            <h1>CloudDeploy AI</h1>

            <h2>Deploy Application</h2>

            <p>
                Enter the local repository path to deploy your application
                to AWS.
            </p>

            <input
                type="text"
                placeholder="C:\Users\dinos\clouddeploy-ai"
                value={repositoryPath}
                onChange={(e) =>
                    setRepositoryPath(e.target.value)
                }
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    padding: "12px",
                    marginTop: "15px"
                }}
            />

            <br />

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
                    : "Deploy Application"}
            </button>

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
                                Website:
                                {" "}
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
                                {
                                    result.deployment.backend
                                        .verification?.statusCode
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Deploy;