import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/product-detail.css';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState('');

  useEffect(() => {
    setLoading(true);
    setSimilar([]);
    setProduct(null);

    fetch(`http://localhost:3000/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
        return fetch(`http://localhost:3000/products?type=${data.type}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setSimilar(data.filter((item) => item._id !== productId));
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setSubmittingAction('cart');
      const res = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          designJSON: null,
          previewImage: product.image,
          material: 'Cotton',
        }),
      });

      if (!res.ok) throw new Error('Failed to add to cart');
      alert('Added to cart!');
    } catch {
      alert('Failed to add to cart. Are you logged in?');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleOrderNow = async () => {
    if (!product) return;

    try {
      setSubmittingAction('order');
      const res = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          designJSON: null,
          previewImage: product.image,
          material: 'Cotton',
        }),
      });

      if (!res.ok) throw new Error('Failed to place order');
      alert('Order placed successfully!');
      navigate('/orders');
    } catch {
      alert('Failed to place order. Are you logged in?');
    } finally {
      setSubmittingAction('');
    }
  };

  if (loading) return <main className="product-detail product-detail--message">Loading...</main>;
  if (!product) return <main className="product-detail product-detail--message">Product not found.</main>;

  return (
    <main className="product-detail">
      <section className="product-detail__hero">
        <button onClick={() => navigate(-1)} className="product-detail__back-btn" type="button">
          Back
        </button>

        <div className="product-detail__top">
          <div className="product-detail__image-shell">
            <img src={product.image} alt={product.name} className="product-detail__image" />
          </div>

          <div className="product-detail__info">
            <p className="product-detail__eyebrow">{product.type}</p>
            <h1>{product.name}</h1>
            <p className="product-detail__price">Rs. {product.price}</p>
            <p className="product-detail__description">{product.description}</p>
            <div className="product-detail__actions">
              <button
                onClick={() => navigate(`/customize/${product._id}`)}
                className="product-detail__secondary-btn"
                type="button"
              >
                Customize
              </button>
              <button
                onClick={handleAddToCart}
                className="product-detail__ghost-btn"
                type="button"
                disabled={submittingAction !== ''}
              >
                {submittingAction === 'cart' ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleOrderNow}
                className="product-detail__primary-btn"
                type="button"
                disabled={submittingAction !== ''}
              >
                {submittingAction === 'order' ? 'Placing...' : 'Order Now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="product-detail__similar">
          <div className="product-detail__section-head">
            <h2>Similar Products</h2>
          </div>
          <div className="product-detail__similar-grid">
            {similar.map((item) => (
              <article
                key={item._id}
                className="product-detail__similar-card"
                onClick={() => navigate(`/products/${item._id}`)}
              >
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>Rs. {item.price}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
