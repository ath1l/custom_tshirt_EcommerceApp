// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate ,useSearchParams } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    fetchProducts();
  }, [type]); // re-fetch whenever type changes

   const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = type
        ? `http://localhost:3000/products?type=${type}`
        : 'http://localhost:3000/products';

      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const typeLabels = { tshirt: 'T-Shirts', hoodie: 'Hoodies', shirt: 'Shirts' };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

   return (
    <div style={{ padding: '20px' }}>
      <h1>{type ? typeLabels[type] : 'All Products'}</h1>

      {products.length === 0 ? (
        <p>No products found for this category.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{ border: '1px solid #ccc', padding: '10px', width: '220px' }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <h3>{product.name}</h3>
              <p>Price: ₹{product.price}</p>
              <p>{product.description}</p>
              <button onClick={() =>navigate(`/products/${product._id}`)}>
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
