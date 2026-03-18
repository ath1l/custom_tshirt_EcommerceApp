import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css";
import { apiUrl } from "../utils/api";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    fetch(apiUrl("/check-auth"), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setIsAuthenticated(Boolean(data.isAuthenticated));
        setIsAdmin(data.user?.role === "admin");
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await fetch(apiUrl("/logout"), {
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
          Custo<span>Me</span>
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
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-btn auth-btn--ghost">Login</Link>
              <Link to="/register" className="auth-btn auth-btn--primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
