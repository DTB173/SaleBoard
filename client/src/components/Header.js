import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";


export default function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  };

  useEffect(() => {
    loadUser();

    const handleUserChange = () => loadUser();
    
    window.addEventListener("storage", handleUserChange);
    window.addEventListener("user-change", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleUserChange);
      window.removeEventListener("user-change", handleUserChange);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Sale Board
        </Link>

        <div className={styles.right}>
          {user ? (
            <>
              <span className={styles.greeting}>
                Hi, <strong>{user.username}</strong>
              </span>

              <Link
                to="/profile"
                className={`${styles.profileBtn} ${
                  isActive("/profile") ? styles.active : ""
                }`}
              >
                Profile
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${styles.authLink} ${
                  isActive("/login") ? styles.active : ""
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`${styles.authLink} ${
                  isActive("/register") ? styles.active : ""
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}