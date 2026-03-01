import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/check-auth', {
        credentials: 'include'
      });
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
      setIsAdmin(data.user?.role === 'admin');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {' | '}
      <Link to="/products">Products</Link>
      {' | '}

      {isAuthenticated ? (
        <>
          <Link to="/cart">Cart 🛒</Link>
          {' | '}
          <Link to="/orders">Orders</Link>
          {' | '}
          {isAdmin && (
            <>
              <Link to="/admin/orders">Admin Panel</Link>
              {' | '}
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          {' | '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;