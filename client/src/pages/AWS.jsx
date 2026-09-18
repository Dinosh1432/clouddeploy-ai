import { useEffect, useState } from "react";
import api from "../services/api";

function AWS() {

    const [resources, setResources] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchAWSResources =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/aws/resources"
                        );


                    setResources(
                        response.data
                    );

                } catch (err) {

                    console.error(err);

                    setError(
                        err.response?.data
                            ?.message ||
                        "Failed to load AWS resources"
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchAWSResources();

    }, []);


    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h2>
                    Loading AWS resources...
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
                AWS Resources
            </h1>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                Real AWS resources used by
                CloudDeploy AI.
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


            {resources && (

                <>


                    {/* Summary */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "20px",
                            marginTop: "25px"
                        }}
                    >

                        <div
                            style={{
                                background: "#fff",
                                padding: "20px",
                                borderRadius: "12px",
                                border:
                                    "1px solid #e2e8f0"
                            }}
                        >

                            <h3>
                                S3 Buckets
                            </h3>

                            <h2>
                                {resources.s3.count}
                            </h2>

                        </div>


                        <div
                            style={{
                                background: "#fff",
                                padding: "20px",
                                borderRadius: "12px",
                                border:
                                    "1px solid #e2e8f0"
                            }}
                        >

                            <h3>
                                EC2 Instances
                            </h3>

                            <h2>
                                {resources.ec2
                                    ? "1"
                                    : "0"}
                            </h2>

                        </div>


                        <div
                            style={{
                                background: "#fff",
                                padding: "20px",
                                borderRadius: "12px",
                                border:
                                    "1px solid #e2e8f0"
                            }}
                        >

                            <h3>
                                Region
                            </h3>

                            <h2>
                                {resources.region}
                            </h2>

                        </div>

                    </div>


                    {/* EC2 */}

                    <div
                        style={{
                            marginTop: "30px",
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "14px",
                            border:
                                "1px solid #e2e8f0"
                        }}
                    >

                        <h2>
                            EC2 Instance
                        </h2>


                        {!resources.ec2 ? (

                            <p
                                style={{
                                    color: "#64748b"
                                }}
                            >
                                No EC2 instance found.
                            </p>

                        ) : (

                            <div>

                                <p>
                                    <strong>
                                        Instance ID:
                                    </strong>{" "}
                                    {resources.ec2.instanceId}
                                </p>


                                <p>
                                    <strong>
                                        State:
                                    </strong>{" "}
                                    {resources.ec2.state}
                                </p>


                                <p>
                                    <strong>
                                        Instance Type:
                                    </strong>{" "}
                                    {resources.ec2.instanceType}
                                </p>


                                <p>
                                    <strong>
                                        Public IP:
                                    </strong>{" "}
                                    {resources.ec2.publicIp ||
                                        "N/A"}
                                </p>


                                <p>
                                    <strong>
                                        Private IP:
                                    </strong>{" "}
                                    {resources.ec2.privateIp ||
                                        "N/A"}
                                </p>


                                <p>
                                    <strong>
                                        Availability Zone:
                                    </strong>{" "}
                                    {resources.ec2.availabilityZone ||
                                        "N/A"}
                                </p>


                                <p>
                                    <strong>
                                        Region:
                                    </strong>{" "}
                                    {resources.ec2.region}
                                </p>


                                <p>
                                    <strong>
                                        Launch Time:
                                    </strong>{" "}
                                    {resources.ec2.launchTime
                                        ? new Date(
                                            resources.ec2.launchTime
                                          ).toLocaleString()
                                        : "N/A"}
                                </p>

                            </div>

                        )}

                    </div>


                    {/* S3 */}

                    <div
                        style={{
                            marginTop: "30px",
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "14px",
                            border:
                                "1px solid #e2e8f0"
                        }}
                    >

                        <h2>
                            S3 Buckets
                        </h2>


                        {resources.s3.buckets
                            .length === 0 ? (

                            <p
                                style={{
                                    color: "#64748b"
                                }}
                            >
                                No CloudDeploy S3
                                buckets found.
                            </p>

                        ) : (

                            resources.s3.buckets.map(
                                (bucket) => (

                                    <div
                                        key={
                                            bucket.name
                                        }
                                        style={{
                                            padding:
                                                "18px 0",
                                            borderBottom:
                                                "1px solid #e2e8f0"
                                        }}
                                    >

                                        <h3>
                                            {bucket.name}
                                        </h3>

                                        <p>
                                            <strong>
                                                Created:
                                            </strong>{" "}

                                            {bucket.createdAt
                                                ? new Date(
                                                    bucket.createdAt
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </p>


                                        <p>

                                            <strong>
                                                Website:
                                            </strong>{" "}

                                            <a
                                                href={`http://${bucket.name}.s3-website.${resources.region}.amazonaws.com`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Open Website
                                            </a>

                                        </p>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </>

            )}

        </div>
    );
}


export default AWS;