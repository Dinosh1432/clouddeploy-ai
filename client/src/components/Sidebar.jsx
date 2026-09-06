import {
    LayoutDashboard,
    FolderGit2,
    Rocket,
    Cloud,
    GitBranch,
    FileText,
    Settings,
    LogOut
} from "lucide-react";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="logo">
                ☁ CloudDeploy AI
            </div>

            <nav>

                <a href="/dashboard">
                    <LayoutDashboard size={20} />
                    Dashboard
                </a>

                <a href="/projects">
                    <FolderGit2 size={20} />
                    Projects
                </a>

                <a href="/deploy">
                    <Rocket size={20} />
                    Deployments
                </a>

                <a href="#">
                    <Cloud size={20} />
                    AWS
                </a>

                <a href="#">
                    <GitBranch size={20} />
                    GitHub
                </a>

                <a href="#">
                    <FileText size={20} />
                    Logs
                </a>

            </nav>

            <div className="sidebar-bottom">

                <a href="#">
                    <Settings size={20} />
                    Settings
                </a>

                <button>
                    <LogOut size={20} />
                    Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;