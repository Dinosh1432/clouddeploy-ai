import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deploy from "./pages/Deploy";
import Deployments from "./pages/Deployments";
import Projects from "./pages/Projects";
import DeploymentDetails from "./pages/DeploymentDetails";

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

            </Routes>

        </BrowserRouter>
    );
}

export default App;