import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const preferLight = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || (preferLight ? 'light' : 'dark');
    } catch (e) {
      return preferLight ? 'light' : 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      aria-label="Toggle theme"
      style={{
        borderRadius: 12,
        padding: '8px 12px',
        border: '1px solid var(--panel-border)',
        background: 'transparent',
        color: 'var(--text)',
        cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}