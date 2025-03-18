import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Navigation hook
import "bootstrap/dist/css/bootstrap.min.css";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import logo from "../../assets/img/LOG.png"; // ✅ Corrected image import
import "../../assets/css/style.css";

const SignIn = () => {
  const [email, setEmail] = useState(""); // Empty initially
  const [password, setPassword] = useState(""); // Empty initially
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Check for token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // Redirect if logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      // ✅ Ensure response matches expected structure
      if (data.token && data.userId && data.fullName && data.email) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("email", data.email);

        navigate("/dashboard"); // ✅ Redirect after successful login
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="main-wrapper">
        <div className="account-content">
          <div className="login-wrapper bg-img">
            <div className="login-content authent-content">
              <form onSubmit={handleSubmit}>
                <div className="login-userset">
                  <div className="login-logo logo-normal">
                    <img src={logo} alt="logo" /> {/* ✅ Fixed image path */}
                  </div>
                  <div className="login-userheading">
                    <h3>Sign In</h3>
                    <h4 className="fs-16">Access the panel using your credentials.</h4>
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Email <span className="text-danger"> *</span></label>
                    <div className="input-group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control border-end-0"
                        required
                        disabled={loading}
                      />
                      <span className="input-group-text border-start-0">
                        <AiOutlineMail size={20} />
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password <span className="text-danger"> *</span></label>
                    <div className="input-group">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control"
                        required
                        disabled={loading}
                      />
                      <span className="input-group-text">
                        <AiOutlineLock size={20} />
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label ms-2" htmlFor="rememberMe">Remember me</label>
                    </div>
                  </div>

                  <div className="form-login">
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </div>

                  <div className="signinform text-center">
                    <h4>New here? <a href="/register" className="hover-a">Create an account</a></h4>
                  </div>

                  <div className="my-4 text-center">
                    <p>Copyright © 2025 DreamsPOS</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
