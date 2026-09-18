import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {

    const [profile, setProfile] =
        useState({
            name: "",
            email: ""
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const response =
                    await api.get(
                        "/auth/profile"
                    );

                setProfile({
                    name:
                        response.data.user?.name ||
                        "",

                    email:
                        response.data.user?.email ||
                        ""
                });

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data
                        ?.message ||
                    "Failed to load profile"
                );

            } finally {

                setLoading(false);

            }
        };


        fetchProfile();

    }, []);


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const handleProfileUpdate = async (
        event
    ) => {

        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {

            const response =
                await api.put(
                    "/auth/profile",
                    {
                        name: profile.name,
                        email: profile.email
                    }
                );

            setProfile({
                name:
                    response.data.user.name,

                email:
                    response.data.user.email
            });


            setMessage(
                "Profile updated successfully."
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data
                    ?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    const handlePasswordChange = async (
        event
    ) => {

        event.preventDefault();

        setMessage("");
        setError("");


        if (
            newPassword !==
            confirmPassword
        ) {

            setError(
                "New passwords do not match."
            );

            return;
        }


        setChangingPassword(true);


        try {

            const response =
                await api.put(
                    "/auth/change-password",
                    {
                        currentPassword,
                        newPassword
                    }
                );


            setMessage(
                response.data.message ||
                "Password changed successfully."
            );


            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data
                    ?.message ||
                "Failed to change password"
            );

        } finally {

            setChangingPassword(false);

        }
    };


    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h2>
                    Loading settings...
                </h2>
            </div>
        );

    }


    return (

        <div
            style={{
                minHeight: "100vh",
                padding: "30px",
                maxWidth: "900px",
                margin: "0 auto",
                background: "#f8fafc"
            }}
        >

            <h1>
                Settings
            </h1>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                Manage your account and security.
            </p>


            {message && (

                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "10px",
                        background: "#dcfce7",
                        color: "#166534"
                    }}
                >
                    ✅ {message}
                </div>

            )}


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
                    ❌ {error}
                </div>

            )}


            {/* ACCOUNT */}

            <div
                style={{
                    marginTop: "25px",
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "14px",
                    border:
                        "1px solid #e2e8f0"
                }}
            >

                <h2>
                    Account
                </h2>

                <form
                    onSubmit={
                        handleProfileUpdate
                    }
                >

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        value={profile.name}
                        onChange={(event) =>
                            setProfile({
                                ...profile,
                                name:
                                    event.target.value
                            })
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px",
                            marginTop: "7px",
                            marginBottom: "18px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={profile.email}
                        onChange={(event) =>
                            setProfile({
                                ...profile,
                                email:
                                    event.target.value
                            })
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px",
                            marginTop: "7px",
                            marginBottom: "18px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding:
                                "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                                saving
                                    ? "not-allowed"
                                    : "pointer",
                            background:
                                "#2563eb",
                            color: "#fff",
                            fontWeight: "600",
                            opacity:
                                saving
                                    ? 0.7
                                    : 1
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </form>

            </div>


            {/* SECURITY */}

            <div
                style={{
                    marginTop: "25px",
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "14px",
                    border:
                        "1px solid #e2e8f0"
                }}
            >

                <h2>
                    Security
                </h2>

                <form
                    onSubmit={
                        handlePasswordChange
                    }
                >

                    <label>
                        Current Password
                    </label>

                    <input
                        type="password"
                        value={
                            currentPassword
                        }
                        onChange={(event) =>
                            setCurrentPassword(
                                event.target.value
                            )
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px",
                            marginTop: "7px",
                            marginBottom: "18px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <label>
                        New Password
                    </label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(
                                event.target.value
                            )
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px",
                            marginTop: "7px",
                            marginBottom: "18px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <label>
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        value={
                            confirmPassword
                        }
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "11px",
                            marginTop: "7px",
                            marginBottom: "18px",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <button
                        type="submit"
                        disabled={
                            changingPassword
                        }
                        style={{
                            padding:
                                "10px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                                changingPassword
                                    ? "not-allowed"
                                    : "pointer",
                            background:
                                "#dc2626",
                            color: "#fff",
                            fontWeight: "600",
                            opacity:
                                changingPassword
                                    ? 0.7
                                    : 1
                        }}
                    >
                        {changingPassword
                            ? "Changing..."
                            : "Change Password"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Settings;