// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();

      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Products</h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                width: '220px'
              }}
            >
              {/* Product thumbnail */}
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', marginBottom: '10px' }}
              />

              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              <p>{product.description}</p>

              <button
                onClick={() => navigate(`/customize/${product._id}`)}
              >
                Customize
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
