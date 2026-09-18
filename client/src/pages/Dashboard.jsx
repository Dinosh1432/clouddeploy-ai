import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateProject from "../components/CreateProject";

import {
    FolderGit2,
    Rocket,
    Cloud,
    Activity,
    ArrowUpRight,
    Plus,
    Server,
    CheckCircle2,
    Clock3
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import api from "../services/api";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [deployments, setDeployments] = useState([]);

    const [awsResources, setAwsResources] = useState({
        s3Buckets: 0,
        ec2Instances: 0
    });

    const [loading, setLoading] = useState(true);
    const [showCreateProject, setShowCreateProject] =
        useState(false);

    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [
                projectsResponse,
                deploymentsResponse,
                awsResponse
            ] = await Promise.allSettled([
                api.get("/projects"),
                api.get("/deployment"),
                api.get("/aws/resources")
            ]);

            // Projects
            if (
                projectsResponse.status ===
                "fulfilled"
            ) {
                setProjects(
                    projectsResponse.value.data.projects || []
                );
            } else {
                console.error(
                    "Failed to fetch projects:",
                    projectsResponse.reason
                );
            }

            // Deployments
            if (
                deploymentsResponse.status ===
                "fulfilled"
            ) {
                setDeployments(
                    deploymentsResponse.value.data
                        .deployments || []
                );
            } else {
                console.error(
                    "Failed to fetch deployments:",
                    deploymentsResponse.reason
                );
            }

            // AWS
            if (
                awsResponse.status ===
                "fulfilled"
            ) {
                const awsData =
                    awsResponse.value.data;

                setAwsResources({
                    s3Buckets:
                        awsData.s3?.count || 0,

                    ec2Instances:
                        awsData.ec2 ? 1 : 0
                });
            } else {
                console.error(
                    "Failed to fetch AWS resources:",
                    awsResponse.reason
                );
            }
        } catch (error) {
            console.error(
                "Dashboard data error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ==========================================
    // COUNTS
    // ==========================================

    const deploymentCount =
        deployments.length;

    const successfulDeploymentCount =
        deployments.filter(
            (deployment) =>
                deployment.status === "success"
        ).length;

    const failedDeploymentCount =
        deployments.filter(
            (deployment) =>
                deployment.status === "failed"
        ).length;

    const deployingCount =
        deployments.filter(
            (deployment) =>
                deployment.status === "deploying"
        ).length;

    const awsResourceCount =
        awsResources.s3Buckets +
        awsResources.ec2Instances;

    const successRate =
        deploymentCount > 0
            ? Math.round(
                  (successfulDeploymentCount /
                      deploymentCount) *
                      100
              )
            : 0;

    const recentDeployments =
        [...deployments]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);

    const recentProjects =
        [...projects]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 4);

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                <Navbar />

                <section className="pro-dashboard">

                    {/* ======================================
                        HERO
                    ======================================= */}

                    <div className="dashboard-hero">

                        <div>

                            <div className="hero-badge">
                                <Cloud size={15} />
                                Cloud deployment platform
                            </div>

                            <h1>
                                Welcome back 👋
                            </h1>

                            <p>
                                Manage your projects,
                                deployments and AWS
                                infrastructure from one
                                place.
                            </p>

                        </div>

                        <button
                            className="hero-create-btn"
                            onClick={() =>
                                setShowCreateProject(true)
                            }
                        >
                            <Plus size={18} />
                            Create Project
                        </button>

                    </div>


                    {/* ======================================
                        STAT CARDS
                    ======================================= */}

                    <div className="pro-stat-grid">

                        <StatCard
                            title="Projects"
                            value={
                                loading
                                    ? "..."
                                    : projects.length
                            }
                            icon={
                                <FolderGit2 size={23} />
                            }
                        />

                        <StatCard
                            title="Deployments"
                            value={
                                loading
                                    ? "..."
                                    : deploymentCount
                            }
                            icon={
                                <Rocket size={23} />
                            }
                        />

                        <StatCard
                            title="AWS Resources"
                            value={
                                loading
                                    ? "..."
                                    : awsResourceCount
                            }
                            icon={
                                <Cloud size={23} />
                            }
                        />

                        <StatCard
                            title="Successful Deployments"
                            value={
                                loading
                                    ? "..."
                                    : successfulDeploymentCount
                            }
                            icon={
                                <Activity size={23} />
                            }
                        />

                    </div>


                    {/* ======================================
                        QUICK OVERVIEW
                    ======================================= */}

                    <div className="overview-grid">

                        {/* Deployment Health */}

                        <div className="overview-card">

                            <div className="overview-header">

                                <div>

                                    <span className="section-kicker">
                                        Deployment health
                                    </span>

                                    <h2>
                                        {successRate}%
                                    </h2>

                                </div>

                                <div className="overview-icon success">
                                    <CheckCircle2 size={20} />
                                </div>

                            </div>


                            <div className="progress-track">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${successRate}%`
                                    }}
                                />

                            </div>


                            <div className="overview-meta">

                                <span>
                                    {successfulDeploymentCount}{" "}
                                    successful
                                </span>

                                <span>
                                    {failedDeploymentCount}{" "}
                                    failed
                                </span>

                            </div>

                        </div>


                        {/* Current Activity */}

                        <div className="overview-card">

                            <div className="overview-header">

                                <div>

                                    <span className="section-kicker">
                                        Current activity
                                    </span>

                                    <h2>
                                        {deployingCount}
                                    </h2>

                                </div>

                                <div className="overview-icon warning">
                                    <Clock3 size={20} />
                                </div>

                            </div>


                            <p className="overview-description">
                                Active deployments
                                currently running.
                            </p>


                            <button
                                className="text-action"
                                onClick={() =>
                                    navigate(
                                        "/deployments"
                                    )
                                }
                            >
                                View deployments
                                <ArrowUpRight size={16} />
                            </button>

                        </div>


                        {/* AWS */}

                        <div className="overview-card">

                            <div className="overview-header">

                                <div>

                                    <span className="section-kicker">
                                        AWS infrastructure
                                    </span>

                                    <h2>
                                        {awsResources.ec2Instances}
                                    </h2>

                                </div>

                                <div className="overview-icon">
                                    <Server size={20} />
                                </div>

                            </div>


                            <p className="overview-description">
                                EC2 instances currently
                                connected to CloudDeploy.
                            </p>


                            <button
                                className="text-action"
                                onClick={() =>
                                    navigate("/aws")
                                }
                            >
                                Open AWS resources
                                <ArrowUpRight size={16} />
                            </button>

                        </div>

                    </div>


                    {/* ======================================
                        MAIN GRID
                    ======================================= */}

                    <div className="dashboard-main-grid">

                        {/* Recent Projects */}

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <span className="section-kicker">
                                        Workspace
                                    </span>

                                    <h2>
                                        Recent Projects
                                    </h2>

                                </div>

                                <button
                                    className="panel-action"
                                    onClick={() =>
                                        navigate(
                                            "/projects"
                                        )
                                    }
                                >
                                    View all
                                    <ArrowUpRight size={15} />
                                </button>

                            </div>


                            {loading ? (

                                <div className="panel-empty">

                                    <p>
                                        Loading projects...
                                    </p>

                                </div>

                            ) : recentProjects.length ===
                              0 ? (

                                <div className="panel-empty">

                                    <FolderGit2 size={36} />

                                    <h3>
                                        No projects yet
                                    </h3>

                                    <p>
                                        Create your first
                                        project to get started.
                                    </p>

                                    <button
                                        onClick={() =>
                                            setShowCreateProject(
                                                true
                                            )
                                        }
                                    >
                                        <Plus size={16} />
                                        Create Project
                                    </button>

                                </div>

                            ) : (

                                <div className="project-list-pro">

                                    {recentProjects.map(
                                        (project) => (

                                            <div
                                                className="project-row"
                                                key={
                                                    project._id
                                                }
                                            >

                                                <div className="project-left">

                                                    <div className="project-avatar">
                                                        <FolderGit2
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div>

                                                        <h3>
                                                            {
                                                                project.name
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                project.description ||
                                                                "No description"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                <span className="status-badge created">
                                                    {project.status ||
                                                        "created"}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* Recent Deployments */}

                        <div className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <span className="section-kicker">
                                        Activity
                                    </span>

                                    <h2>
                                        Recent Deployments
                                    </h2>

                                </div>

                                <button
                                    className="panel-action"
                                    onClick={() =>
                                        navigate(
                                            "/deployments"
                                        )
                                    }
                                >
                                    View all
                                    <ArrowUpRight size={15} />
                                </button>

                            </div>


                            {recentDeployments.length ===
                            0 ? (

                                <div className="panel-empty">

                                    <Rocket size={36} />

                                    <h3>
                                        No deployments yet
                                    </h3>

                                    <p>
                                        Deploy a project to
                                        see activity here.
                                    </p>

                                </div>

                            ) : (

                                <div className="deployment-list">

                                    {recentDeployments.map(
                                        (deployment) => (

                                            <div
                                                className="deployment-row"
                                                key={
                                                    deployment._id
                                                }
                                            >

                                                <div>

                                                    <h3>
                                                        {
                                                            deployment
                                                                .project
                                                                ?.name ||
                                                            "Unknown Project"
                                                        }
                                                    </h3>

                                                    <p>
                                                        {new Date(
                                                            deployment.createdAt
                                                        ).toLocaleString()}
                                                    </p>

                                                </div>


                                                <span
                                                    className={`status-badge ${
                                                        deployment.status
                                                    }`}
                                                >
                                                    {deployment.status ===
                                                    "success"
                                                        ? "Success"
                                                        : deployment.status ===
                                                          "failed"
                                                        ? "Failed"
                                                        : "Deploying"}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* ==================================
                    CREATE PROJECT
                ================================== */}

                {showCreateProject && (

                    <CreateProject
                        onClose={() =>
                            setShowCreateProject(
                                false
                            )
                        }

                        onProjectCreated={(
                            project
                        ) => {

                            setProjects(
                                (
                                    previousProjects
                                ) => [
                                    project,
                                    ...previousProjects
                                ]
                            );

                            setShowCreateProject(false);

                        }}
                    />

                )}

            </main>

        </div>
    );
}

export default Dashboard;