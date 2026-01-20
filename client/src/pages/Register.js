import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import styles from "./Register.module.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password, confirmPassword, full_name, phone, address } = form;

    if (!email.includes("@")) return setError("Invalid email"), setLoading(false);
    if (password.length < 6) return setError("Password must be 6+ chars"), setLoading(false);
    if (password !== confirmPassword) return setError("Passwords don't match"), setLoading(false);
    if (!full_name.trim()) return setError("Full name is required"), setLoading(false);

    try {
      const regRes = await api.post("/auth/register", {
        email,
        password,
        full_name,
        phone: phone || null,
        address: address || null,
      });

      const user = regRes.data;
      const loginRes = await api.post("/auth/login", { email, password });
      const { token } = loginRes.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.full_name,
          email: user.email,
        })
      );
      window.dispatchEvent(new Event("storage"));

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Sale Board today</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="+48 123 456 789"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              placeholder="ul. Example 123, Warsaw"
              value={form.address}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="6+ characters"
              value={form.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Confirm Password <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <>
                <span className={styles.spinner}></span> Creating...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}