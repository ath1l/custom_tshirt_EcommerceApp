import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import "../styles/background.css";
import "../styles/login.css";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show error if Google OAuth failed (redirected back with ?error=google_failed)
  const [searchParams] = useSearchParams();
  const googleError = searchParams.get('error') === 'google_failed';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      response.ok
        ? (window.location.href = '/products')
        : setError(data.message || 'Login failed');
    } catch (err) {
      setError('Network error. backend not running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">Sign in to continue shopping.</p>

        {(error || googleError) && (
          <p className="login-error">
            {googleError ? 'Google sign-in failed. Please try again.' : error}
          </p>
        )}

        {/* ── Google sign-in ── */}
        {/* This is a plain redirect, not a fetch() call.
            Why? Because OAuth requires the browser to actually navigate to Google.
            You can't do OAuth inside a fetch — Google won't set cookies cross-origin. */}
        <a
          href="http://localhost:3000/auth/google"
          className="google-btn"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt=""
            width="18"
            height="18"
          />
          Continue with Google
        </a>

        <div className="login-divider">
          <span>or</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;