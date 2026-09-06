import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deploy from "./pages/Deploy";
import Projects from "./pages/Projects";

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

            </Routes>

        </BrowserRouter>
    );
}

export default App;