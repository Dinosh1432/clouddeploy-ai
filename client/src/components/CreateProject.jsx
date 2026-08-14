import { useState } from "react";
import api from "../services/api";

function CreateProject({ onProjectCreated, onClose }) {

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        repositoryUrl: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/projects",
                formData
            );

            onProjectCreated(response.data.project);

            onClose();

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to create project"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h2>
                        Create Project
                    </h2>

                    <button onClick={onClose}>
                        ✕
                    </button>

                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Project Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder="My AWS Project"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />


                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        placeholder="Describe your project"
                        value={formData.description}
                        onChange={handleChange}
                    />


                    <label>
                        GitHub Repository URL
                    </label>

                    <input
                        type="url"
                        name="repositoryUrl"
                        placeholder="https://github.com/username/project"
                        value={formData.repositoryUrl}
                        onChange={handleChange}
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Project"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateProject;