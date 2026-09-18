import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deploy from "./pages/Deploy";
import Deployments from "./pages/Deployments";
import Projects from "./pages/Projects";
import DeploymentDetails from "./pages/DeploymentDetails";
import GitHub from "./pages/GitHub";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";

import AWS from "./pages/AWS";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                path="/projects"
                element={<Projects />}
                />
                <Route
                    path="/deploy"
                    element={<Deploy />}
                />
                <Route 
                path="/deployments" 
                element={<Deployments />} />


                <Route
                path="/deployments/:id"
                element={<DeploymentDetails />} />

                <Route 
                path="/aws"
                 element={<AWS />} />
                 <Route
                 path="/github"
                 element={<GitHub />}
                />

                <Route
                path="/logs"
                element={<Logs />}
                />
                <Route
                    path="/settings"
                    element={<Settings />}
                />

        

            </Routes>

        </BrowserRouter>
    );
}

export default App;