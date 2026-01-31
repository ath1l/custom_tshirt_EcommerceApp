// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react';

function Products() {
  // State to store products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products when component loads
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

  // Show loading message
  if (loading) {
    return <div>Loading products...</div>;
  }

  // Show error if fetch failed
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Show products
  return (
    <div>
      <h1>Products</h1>
      
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div>
          {products.map((product) => (
            <div key={product._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;