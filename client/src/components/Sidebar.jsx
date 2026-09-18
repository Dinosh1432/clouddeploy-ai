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

import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="sidebar">

            <div className="logo">
                ☁ CloudDeploy AI
            </div>

            <nav>

                <Link to="/dashboard">
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                <Link to="/projects">
                    <FolderGit2 size={20} />
                    Projects
                </Link>

                <Link to="/deployments">
                    <Rocket size={20} />
                    Deployments
                </Link>

                <Link to="/aws">
                    <Cloud size={20} />
                    AWS
                </Link>

                <Link to="/github">
                    <GitBranch size={20} />
                    GitHub
                </Link>

                <Link to="/logs">
                    <FileText size={20} />
                    Logs
                </Link>

            </nav>

            <div className="sidebar-bottom">

                <Link to="/settings">
                    <Settings size={20} />
                    Settings
                </Link>

                <button onClick={handleLogout}>
                    <LogOut size={20} />
                    Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;