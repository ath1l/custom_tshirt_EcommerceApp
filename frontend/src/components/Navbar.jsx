import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // TEMPORARILY DISABLED auth check
  useEffect(() => {
    // checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/check-auth', {
        credentials: 'include'
      });
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
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
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {' | '}
      <Link to="/products">Products</Link>
      {' | '}
      <Link to="/orders">Orders</Link>
      {' | '}

      {!isAuthenticated ? (
        <>
          <Link to="/login">Login</Link>
          {' | '}
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </nav>
  );
}

export default Navbar;
