import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/navbar.css";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const signinRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (signinRef.current && !signinRef.current.contains(event.target)) {
        setIsSigninOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:3000/check-auth", {
        credentials: "include",
      });
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
      setIsAdmin(data.user?.role === "admin");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => navigate("/")}>
          W<span>earify</span>
        </div>

        <div className="navbar__links">
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/products" className="navbar__link">Products</Link>

          {isAuthenticated && (
            <>
              <Link to="/cart" className="navbar__link">Cart</Link>
              <Link to="/orders" className="navbar__link">Orders</Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin/orders" className="navbar__link">Admin</Link>
          )}
        </div>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>

              <div className="profile-icon" onClick={() => navigate("/profile")}>
                P
              </div>
            </>
          ) : (
            <div
              className={`signin-dropdown ${isSigninOpen ? "is-open" : ""}`}
              ref={signinRef}
            >
              <button
                type="button"
                className="signin-text"
                onClick={() => setIsSigninOpen((prev) => !prev)}
              >
                Sign In
              </button>
              <div className="dropdown-menu">
                <Link to="/login" onClick={() => setIsSigninOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsSigninOpen(false)}>Register</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
