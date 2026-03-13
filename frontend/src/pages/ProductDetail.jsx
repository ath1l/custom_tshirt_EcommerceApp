import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/product-detail.css';
import { openRazorpayCheckout } from '../utils/razorpay';

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
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

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
        setSelectedImage(productData.image);
        setQuantity(1);

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
  const productImages = [product.image, ...(product.galleryImages || [])].filter(Boolean);
  const isOutOfStock = Boolean(product.isOutOfStock);
  const highlights = [
    'Made for custom prints',
    'Soft everyday fabric feel',
    'Built for repeat wear',
  ];

  const basePayload = {
    productId: product._id,
    designJSON: { version: '7.1.0', objects: [] },
    previewImage: selectedImage || product.image,
    material: 'Cotton',
    quantity,
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

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add to cart');
      }

      alert('Added to cart successfully.');
    } catch (error) {
      alert(error.message || 'Failed to add to cart.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleOrderNow = async () => {
  try {
    setSubmittingAction('order');

    const paymentResponse = await openRazorpayCheckout(product.price * quantity, `${product.name} x${quantity}`);

    const verifyRes = await fetch('http://localhost:3000/payment/verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...paymentResponse,
        type: 'single',
        singleItem: basePayload,
      }),
    });

    if (verifyRes.status === 401) {
      navigate('/login');
      return;
    }

    if (!verifyRes.ok) throw new Error('Payment verification failed');

    alert('Order placed successfully.');
    navigate('/orders');
  } catch (err) {
    if (err.message !== 'Payment cancelled') {
      console.error('Order failed:', err);
      alert('Failed to place order. Please try again.');
    }
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
              src={selectedImage || product.image}
              alt={product.name}
              className="product-detail__image"
            />
          </div>
          {productImages.length > 1 && (
            <div className="product-detail__gallery">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`product-detail__gallery-thumb ${
                    image === (selectedImage || product.image) ? 'product-detail__gallery-thumb--active' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__content">
          <p className="product-detail__eyebrow">{displayType} collection</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">Rs. {product.price}</p>
          <p className="product-detail__description">
            {product.description || 'A clean base product designed for custom styling and daily wear.'}
          </p>

          <div className="product-detail__quantity">
            <span>Quantity</span>
            <div className="product-detail__quantity-controls">
              <button
                type="button"
                className="product-detail__qty-btn"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={submittingAction !== '' || quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="product-detail__qty-input"
                disabled={submittingAction !== ''}
              />
              <button
                type="button"
                className="product-detail__qty-btn"
                onClick={() => setQuantity((current) => current + 1)}
                disabled={submittingAction !== ''}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-detail__actions">
            <button
              type="button"
              className="product-detail__secondary-btn"
              onClick={() => navigate(`/customize/${product._id}`)}
              disabled={isOutOfStock || submittingAction !== ''}
            >
              {isOutOfStock ? 'Out of Stock' : 'Customize'}
            </button>
            <button
              type="button"
              className="product-detail__ghost-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock || submittingAction !== ''}
            >
              {isOutOfStock ? 'Unavailable' : submittingAction === 'cart' ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              type="button"
              className="product-detail__primary-btn"
              onClick={handleOrderNow}
              disabled={isOutOfStock || submittingAction !== ''}
            >
              {isOutOfStock ? 'Unavailable' : submittingAction === 'order' ? 'Placing Order...' : 'Order Now'}
            </button>
          </div>

          {isOutOfStock && <p className="product-detail__stock-note">This product is currently out of stock.</p>}

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
