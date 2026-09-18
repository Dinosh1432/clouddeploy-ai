import { useEffect, useState } from "react";
import api from "../services/api";

function GitHub() {

    const [repositories, setRepositories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchRepositories =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/github/repositories"
                        );

                    setRepositories(
                        response.data.repositories ||
                        []
                    );

                } catch (err) {

                    console.error(err);

                    setError(
                        err.response?.data
                            ?.message ||
                        "Failed to load GitHub repositories"
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchRepositories();

    }, []);


    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h2>
                    Loading GitHub repositories...
                </h2>
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

            <h1>
                GitHub
            </h1>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                GitHub repositories connected to
                your CloudDeploy AI projects.
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
                    <strong>
                        Error:
                    </strong>{" "}
                    {error}
                </div>

            )}


            {!error &&
                repositories.length === 0 && (

                <div
                    style={{
                        marginTop: "25px",
                        background: "#fff",
                        padding: "30px",
                        borderRadius: "14px",
                        border:
                            "1px solid #e2e8f0",
                        textAlign: "center"
                    }}
                >

                    <h3>
                        No GitHub repositories
                        connected
                    </h3>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        Create a project with a
                        GitHub repository to see
                        it here.
                    </p>

                </div>

            )}


            {repositories.map(
                (repository) => (

                    <div
                        key={
                            repository.projectId
                        }
                        style={{
                            marginTop: "20px",
                            background: "#fff",
                            border:
                                "1px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "24px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.04)"
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
                                    {
                                        repository
                                            .projectName
                                    }
                                </h2>

                                <p
                                    style={{
                                        marginTop:
                                            "8px",
                                        color:
                                            "#64748b"
                                    }}
                                >
                                    {
                                        repository
                                            .description ||
                                        "No description"
                                    }
                                </p>

                            </div>


                            <div
                                style={{
                                    padding:
                                        "7px 12px",
                                    borderRadius:
                                        "20px",
                                    background:
                                        repository
                                            .private
                                            ? "#fef3c7"
                                            : "#dcfce7",
                                    color:
                                        repository
                                            .private
                                            ? "#92400e"
                                            : "#166534",
                                    fontWeight:
                                        "600"
                                }}
                            >
                                {repository.private
                                    ? "🔒 Private"
                                    : "🌐 Public"}
                            </div>

                        </div>


                        <div
                            style={{
                                marginTop: "20px",
                                padding: "18px",
                                borderRadius:
                                    "10px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0"
                            }}
                        >

                            <p>
                                <strong>
                                    Repository:
                                </strong>{" "}
                                {
                                    repository.fullName
                                }
                            </p>


                            <p>
                                <strong>
                                    Branch:
                                </strong>{" "}
                                {
                                    repository
                                        .defaultBranch
                                }
                            </p>


                            <p>
                                <strong>
                                    Language:
                                </strong>{" "}
                                {
                                    repository
                                        .language ||
                                    "Not specified"
                                }
                            </p>


                            <p>
                                <strong>
                                    Owner:
                                </strong>{" "}
                                {
                                    repository.owner
                                }
                            </p>


                            {repository
                                .repositoryUrl && (
                                <p>
                                    <strong>
                                        GitHub:
                                    </strong>{" "}

                                    <a
                                        href={
                                            repository
                                                .repositoryUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open Repository
                                    </a>
                                </p>
                            )}

                        </div>

                    </div>

                )
            )}

        </div>
    );
}

export default GitHub;