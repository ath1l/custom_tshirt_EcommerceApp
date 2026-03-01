import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSimilar([]);
    setProduct(null);

    fetch(`http://localhost:3000/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);

        // Fetch similar products of same type
        return fetch(`http://localhost:3000/products?type=${data.type}`);
      })
      .then(res => res.json())
      .then(data => {
        // Exclude current product
        setSimilar(data.filter(p => p._id !== productId));
      })
      .catch(() => setLoading(false));
  }, [productId]); // re-runs when navigating to a different product

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        ← Back
      </button>

      {/* ── MAIN PRODUCT ── */}
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', marginBottom: '20px' }}
      />
      <h2>{product.name}</h2>
      <p><strong>Price:</strong> ₹{product.price}</p>
      <p><strong>Type:</strong> {product.type}</p>
      <p><strong>Description:</strong> {product.description}</p>

      <button
        onClick={() => navigate(`/customize/${product._id}`)}
        style={{ marginTop: '20px', padding: '10px 24px', fontSize: '16px', cursor: 'pointer' }}
      >
        Start Customizing →
      </button>

      {/* ── SIMILAR PRODUCTS ── */}
      {similar.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ marginBottom: '16px' }}>Similar Products</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {similar.map(p => (
              <div
                key={p._id}
                onClick={() => navigate(`/products/${p._id}`)}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  width: '160px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '8px' }}
                />
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>{p.name}</p>
                <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>₹{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;