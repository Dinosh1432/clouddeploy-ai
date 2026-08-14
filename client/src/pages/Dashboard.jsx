import { useEffect, useState } from "react";
import CreateProject from "../components/CreateProject";
import {
    FolderGit2,
    Rocket,
    Cloud,
    Activity
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import api from "../services/api";

function Dashboard() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateProject, setShowCreateProject] =
    useState(false);

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects");

            setProjects(response.data.projects);

        } catch (error) {
            console.error(
                "Failed to fetch projects:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="main-content">

                <Navbar />

                <section className="dashboard-content">

                    <div className="welcome">
                        <h1>
                            Welcome back 👋
                        </h1>

                        <p>
                            Manage your projects and cloud deployments.
                        </p>
                    </div>


                    <div className="stats-grid">

                        <StatCard
                            title="Projects"
                            value={projects.length}
                            icon={<FolderGit2 size={24} />}
                        />

                        <StatCard
                            title="Deployments"
                            value="0"
                            icon={<Rocket size={24} />}
                        />

                        <StatCard
                            title="AWS Resources"
                            value="0"
                            icon={<Cloud size={24} />}
                        />

                        <StatCard
                            title="Successful Deployments"
                            value="0"
                            icon={<Activity size={24} />}
                        />

                    </div>


                    <div className="projects-section">

                        <div className="section-header">

                            <h2>
                                Recent Projects
                            </h2>

                            <button onClick={() => setShowCreateProject(true)}>
                                + Create Project
                            </button>
                        </div>


                        {loading ? (

                            <div className="empty-state">
                                <p>Loading projects...</p>
                            </div>

                        ) : projects.length === 0 ? (

                            <div className="empty-state">

                                <FolderGit2 size={48} />

                                <h3>
                                    No projects yet
                                </h3>

                                <p>
                                    Create your first project to start deploying.
                                </p>

                            </div>

                        ) : (

                            <div className="project-list">

                                {projects.map((project) => (

                                    <div
                                        className="project-card"
                                        key={project._id}
                                    >

                                        <div>

                                            <h3>
                                                {project.name}
                                            </h3>

                                            <p>
                                                {project.description ||
                                                    "No description"}
                                            </p>

                                        </div>

                                        <span>
                                            {project.status}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </section>
            {showCreateProject && (
                <CreateProject
                    onClose={() => setShowCreateProject(false)}
                    onProjectCreated={(project) => {
                        setProjects((prev) => [
                            project,
                            ...prev
                        ]);
                    }}
                />
            )}

            </main>

        </div>
    );
}

export default Dashboard;