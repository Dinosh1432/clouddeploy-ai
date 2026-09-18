import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Cloud,
    ArrowRight
} from "lucide-react";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!form.email || !form.password) {
            setError(
                "Please enter your email and password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                {
                    email: form.email,
                    password: form.password
                }
            );

            const { token, user } = response.data;

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            navigate("/dashboard");

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                background: "#f8fafc"
            }}
        >
            {/* =====================================
                LEFT SIDE
            ====================================== */}

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "45px",
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
                    color: "#fff"
                }}
            >
                <div>
                    {/* Logo */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "22px",
                            fontWeight: "700"
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    "rgba(255,255,255,0.12)"
                            }}
                        >
                            <Cloud size={23} />
                        </div>

                        CloudDeploy AI
                    </div>

                    {/* Hero */}

                    <div
                        style={{
                            marginTop: "110px",
                            maxWidth: "560px"
                        }}
                    >
                        <div
                            style={{
                                display: "inline-block",
                                padding: "7px 12px",
                                borderRadius: "20px",
                                background:
                                    "rgba(255,255,255,0.10)",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "20px"
                            }}
                        >
                            Intelligent Cloud Deployment
                        </div>

                        <h1
                            style={{
                                fontSize: "48px",
                                lineHeight: "1.1",
                                margin:
                                    "0 0 20px"
                            }}
                        >
                            Deploy smarter.
                            <br />
                            Scale faster.
                        </h1>

                        <p
                            style={{
                                fontSize: "17px",
                                lineHeight: "1.7",
                                color:
                                    "rgba(255,255,255,0.78)",
                                margin: 0
                            }}
                        >
                            Connect your GitHub
                            repository, analyze your
                            application, and deploy
                            your frontend and backend
                            to AWS with CloudDeploy AI.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        color:
                            "rgba(255,255,255,0.55)",
                        fontSize: "13px"
                    }}
                >
                    © 2026 CloudDeploy AI
                </div>
            </div>

            {/* =====================================
                RIGHT SIDE
            ====================================== */}

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "35px",
                    background: "#f8fafc"
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "440px"
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: "38px",
                            borderRadius: "20px",
                            border:
                                "1px solid #e2e8f0",
                            boxShadow:
                                "0 12px 40px rgba(15,23,42,0.08)"
                        }}
                    >
                        <div
                            style={{
                                marginBottom: "30px"
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "30px",
                                    color: "#0f172a"
                                }}
                            >
                                Welcome back
                            </h2>

                            <p
                                style={{
                                    marginTop: "9px",
                                    marginBottom: 0,
                                    color: "#64748b"
                                }}
                            >
                                Sign in to your CloudDeploy AI
                                account.
                            </p>
                        </div>

                        {/* Error */}

                        {error && (
                            <div
                                style={{
                                    marginBottom: "20px",
                                    padding: "13px 14px",
                                    borderRadius: "10px",
                                    background: "#fef2f2",
                                    border:
                                        "1px solid #fecaca",
                                    color: "#b91c1c",
                                    fontSize: "14px"
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                        >
                            {/* Email */}

                            <div
                                style={{
                                    marginBottom: "18px"
                                }}
                            >
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#334155"
                                    }}
                                >
                                    Email address
                                </label>

                                <div
                                    style={{
                                        position: "relative"
                                    }}
                                >
                                    <Mail
                                        size={18}
                                        style={{
                                            position:
                                                "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            color: "#94a3b8"
                                        }}
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="email"
                                        style={{
                                            width: "100%",
                                            boxSizing:
                                                "border-box",
                                            padding:
                                                "13px 14px 13px 44px",
                                            border:
                                                "1px solid #cbd5e1",
                                            borderRadius:
                                                "10px",
                                            outline: "none",
                                            fontSize: "15px"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}

                            <div
                                style={{
                                    marginBottom: "22px"
                                }}
                            >
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#334155"
                                    }}
                                >
                                    Password
                                </label>

                                <div
                                    style={{
                                        position: "relative"
                                    }}
                                >
                                    <Lock
                                        size={18}
                                        style={{
                                            position:
                                                "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            color: "#94a3b8"
                                        }}
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="current-password"
                                        style={{
                                            width: "100%",
                                            boxSizing:
                                                "border-box",
                                            padding:
                                                "13px 45px 13px 44px",
                                            border:
                                                "1px solid #cbd5e1",
                                            borderRadius:
                                                "10px",
                                            outline: "none",
                                            fontSize: "15px"
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        style={{
                                            position:
                                                "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform:
                                                "translateY(-50%)",
                                            border: "none",
                                            background:
                                                "transparent",
                                            cursor: "pointer",
                                            color: "#64748b"
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Login button */}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "13px 18px",
                                    border: "none",
                                    borderRadius: "10px",
                                    background: "#2563eb",
                                    color: "#fff",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    opacity: loading
                                        ? 0.7
                                        : 1
                                }}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}

                                {!loading && (
                                    <ArrowRight
                                        size={18}
                                    />
                                )}
                            </button>
                        </form>

                        {/* Divider */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                margin:
                                    "26px 0"
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    height: "1px",
                                    background:
                                        "#e2e8f0"
                                }}
                            />

                            <span
                                style={{
                                    color:
                                        "#94a3b8",
                                    fontSize:
                                        "13px"
                                }}
                            >
                                New here?
                            </span>

                            <div
                                style={{
                                    flex: 1,
                                    height: "1px",
                                    background:
                                        "#e2e8f0"
                                }}
                            />
                        </div>

                        {/* Register */}

                        <Link
                            to="/register"
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                width: "100%",
                                boxSizing:
                                    "border-box",
                                padding:
                                    "12px 18px",
                                border:
                                    "1px solid #cbd5e1",
                                borderRadius:
                                    "10px",
                                textDecoration:
                                    "none",
                                color: "#0f172a",
                                fontWeight:
                                    "600",
                                fontSize: "14px"
                            }}
                        >
                            Create an account
                        </Link>

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "22px",
                                color: "#94a3b8",
                                fontSize: "12px"
                            }}
                        >
                            GitHub-powered deployments
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;