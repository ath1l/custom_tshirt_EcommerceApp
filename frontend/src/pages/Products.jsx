import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get('type') || 'all';

  const categories = [
    { label: 'All Products', value: 'all', image: '/category thumb/all product.png' },
    { label: 'T-Shirts', value: 'tshirt', image: '/category thumb/t shirt.webp' },
    { label: 'Hoodies', value: 'hoodie', image: '/category thumb/hoodies.webp' },
    { label: 'Shirts', value: 'shirt', image: '/category thumb/shirt.jpg' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const url = selectedType === 'all'
        ? 'http://localhost:3000/products'
        : `http://localhost:3000/products?type=${selectedType}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = { tshirt: 'T-Shirts', hoodie: 'Hoodies', shirt: 'Shirts' };

  const handleCategoryClick = (value) => {
    if (value === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ type: value });
  };

  if (loading) {
    return <div className="products-page products-message">Loading products...</div>;
  }

  if (error) {
    return <div className="products-page products-message">Error: {error}</div>;
  }

  return (
    <main className="products-page">
      <section className="products-categories">
        <h2>Categories</h2>
        <div className="products-categories-grid">
          {categories.map((category) => (
            <button
              key={category.value}
              className={`products-category-card ${selectedType === category.value ? 'is-active' : ''}`}
              onClick={() => handleCategoryClick(category.value)}
              type="button"
            >
              <img src={category.image} alt={category.label} loading="lazy" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <h1>{selectedType === 'all' ? 'All Products' : typeLabels[selectedType]}</h1>

      {products.length === 0 ? (
        <p>No products found for this category.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product._id}
              className="products-card"
              onClick={() => navigate(`/products/${product._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/products/${product._id}`);
                }
              }}
            >
              <img src={product.image} alt={product.name} className="products-card-image" />
              {product.isOutOfStock && <span className="products-card__badge">Out of stock</span>}
              <h3>{product.name}</h3>
              <p className="products-price">Rs. {product.price}</p>
              <p className="products-description">{product.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product._id}`);
                }}
                type="button"
              >
                {product.isOutOfStock ? 'View Details' : 'View Product'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Products;
