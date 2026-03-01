import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/products/${productId}`)
      .then(res => res.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        ← Back
      </button>

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
    </div>
  );
}

export default ProductDetail;