import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          © {new Date().getFullYear()} <strong>Sale Board</strong> — Your local marketplace.
        </p>
        <p className={styles.meta}>
          Project created with <span className={styles.heart}>love</span> using React + Vite.
        </p>
        <p className={styles.meta}>
          <a href="https://github.com/DTB173" target="_blank" rel="noopener" className={styles.link}>
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}