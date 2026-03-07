import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/product-detail.css';

const typeLabels = {
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  shirt: 'Shirt',
};

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProduct(null);
        setSimilar([]);

        const productRes = await fetch(`http://localhost:3000/products/${productId}`);
        if (!productRes.ok) {
          throw new Error('Failed to load product');
        }

        const productData = await productRes.json();
        if (isCancelled) {
          return;
        }

        setProduct(productData);

        const similarRes = await fetch(`http://localhost:3000/products?type=${productData.type}`);
        if (!similarRes.ok) {
          throw new Error('Failed to load related products');
        }

        const similarData = await similarRes.json();
        if (!isCancelled) {
          setSimilar(similarData.filter((item) => item._id !== productId).slice(0, 4));
        }
      } catch {
        if (!isCancelled) {
          setProduct(null);
          setSimilar([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  if (loading) {
    return <main className="product-detail product-detail--message">Loading product...</main>;
  }

  if (!product) {
    return (
      <main className="product-detail product-detail--message">
        <p>Product not found.</p>
        <button type="button" className="product-detail__back-link" onClick={() => navigate('/products')}>
          Return to products
        </button>
      </main>
    );
  }

  const displayType = typeLabels[product.type] || product.type;
  const highlights = [
    'Made for custom prints',
    'Soft everyday fabric feel',
    'Built for repeat wear',
  ];

  const basePayload = {
    productId: product._id,
    designJSON: null,
    previewImage: product.image,
    material: 'Cotton',
  };

  const handleAddToCart = async () => {
    try {
      setSubmittingAction('cart');
      const response = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      alert('Added to cart successfully.');
    } catch {
      alert('Failed to add to cart. Please log in and try again.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleOrderNow = async () => {
    try {
      setSubmittingAction('order');
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      alert('Order placed successfully.');
      navigate('/orders');
    } catch {
      alert('Failed to place order. Please log in and try again.');
    } finally {
      setSubmittingAction('');
    }
  };

  return (
    <main className="product-detail">
      <section className="product-detail__hero">
        <div className="product-detail__media">
          <button type="button" className="product-detail__back-link" onClick={() => navigate(-1)}>
            Back
          </button>
          <div className="product-detail__image-shell">
            <img
              src={product.image}
              alt={product.name}
              className="product-detail__image"
            />
          </div>
        </div>

        <div className="product-detail__content">
          <p className="product-detail__eyebrow">{displayType} collection</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">Rs. {product.price}</p>
          <p className="product-detail__description">
            {product.description || 'A clean base product designed for custom styling and daily wear.'}
          </p>

          <div className="product-detail__actions">
            <button
              type="button"
              className="product-detail__primary-btn"
              onClick={handleAddToCart}
              disabled={submittingAction !== ''}
            >
              {submittingAction === 'cart' ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              type="button"
              className="product-detail__secondary-btn"
              onClick={handleOrderNow}
              disabled={submittingAction !== ''}
            >
              {submittingAction === 'order' ? 'Placing Order...' : 'Order Now'}
            </button>
          </div>

          <div className="product-detail__meta-grid">
            <article>
              <span>Category</span>
              <strong>{displayType}</strong>
            </article>
            <article>
              <span>Printing</span>
              <strong>Front-ready</strong>
            </article>
            <article>
              <span>Style</span>
              <strong>Custom fit look</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="product-detail__info-band">
        <div>
          <p className="product-detail__section-tag">Why this works</p>
          <h2>Designed as a clean canvas for your own brand, team, or personal design.</h2>
        </div>
        <div className="product-detail__highlight-list">
          {highlights.map((highlight) => (
            <article key={highlight}>
              <span className="product-detail__highlight-dot" />
              <p>{highlight}</p>
            </article>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="product-detail__similar">
          <div className="product-detail__section-head">
            <div>
              <p className="product-detail__section-tag">Similar products</p>
              <h2>More options in the same category</h2>
            </div>
            <button
              type="button"
              className="product-detail__text-btn"
              onClick={() => navigate(`/products?type=${product.type}`)}
            >
              View all {displayType}s
            </button>
          </div>

          <div className="product-detail__similar-grid">
            {similar.map((item) => (
              <article
                key={item._id}
                className="product-detail__similar-card"
                onClick={() => navigate(`/products/${item._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/products/${item._id}`);
                  }
                }}
              >
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description || 'Customizable apparel with a clean finish.'}</p>
                  <strong>Rs. {item.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
