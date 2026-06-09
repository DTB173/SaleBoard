import { Link, useLocation } from "react-router-dom";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";

import styles from "./Header.module.css";

export default function Header() {
  const location = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  // Wait until Clerk is loaded
  if (!isLoaded) {
    return <header className={styles.header}>Loading...</header>;
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Sale Board
        </Link>

        <div className={styles.right}>
          <SignedIn>
            <Link
              to="/add-product"
              className={`${styles.navLink} ${isActive("/add-product") ? styles.active : ""}`}
            >
              + Sell Item
            </Link>

            <Link
              to="/profile"
              className={`${styles.profileBtn} ${isActive("/profile") ? styles.active : ""}`}
            >
              {user?.fullName || user?.username || "Profile"}
            </Link>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </SignedIn>

          <SignedOut>
            <Link
              to="/login"
              className={`${styles.authLink} ${isActive("/login") ? styles.active : ""}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`${styles.authLink} ${isActive("/register") ? styles.active : ""}`}
            >
              Register
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}