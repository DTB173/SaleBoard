import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import styles from "./Login.module.css";
import {jwtDecode} from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token } = res.data;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      const user = {
        username: decoded.email.split("@")[0],
        email: decoded.email,
      };
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("user-change"));
      navigate("/", { replace: true });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to manage your products</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <span className={styles.spinner}></span> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <Link to="/register" className={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}