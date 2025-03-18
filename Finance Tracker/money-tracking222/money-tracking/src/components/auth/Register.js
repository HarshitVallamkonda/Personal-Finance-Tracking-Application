import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import for redirection
import "../../assets/css/style.css";

import logoWhite from "../../assets/img/logo-white.svg";
import logo from "../../assets/img/LOG.png"; // ✅ Corrected image import

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, redirect to dashboard
      navigate("/dashboard");
    }
  }, [navigate]); // Dependency array includes navigate

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agree) {
      setError("You must agree to the Terms & Privacy");
      setLoading(false);
      return;
    }

    const registerData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };

    console.log("Sending request:", registerData);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status: ${response.status}`);
      }

      console.log("Registration successful:", data);
      alert("Registration successful! Please sign in.");
      navigate("/"); // Redirect to sign-in page on success

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-content">
        <div className="login-wrapper register-wrap bg-img">
          <div className="login-content authent-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                <img src={logo} alt="logo" /> {/* ✅ Fixed image path */}
                </div>
                <a href="/" className="login-logo logo-white">
                  <img src={logoWhite} alt="logo white" />
                </a>
                <div className="login-userheading">
                  <h3>Register</h3>
                  <h4>Create New Account</h4>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="custom-control custom-checkbox">
                  <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={formData.agree}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="checkmarks"></span>
                    I agree to the{" "}
                    <a href="#" className="text-primary">
                      Terms & Privacy
                    </a>
                  </label>
                </div>

                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={loading}
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
                <div className="signinform">
                  <h4>
                    Already have an account? <a href="/">Sign In</a>
                  </h4>
                </div>
                <div className="my-4 copyright-text">
                 
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;