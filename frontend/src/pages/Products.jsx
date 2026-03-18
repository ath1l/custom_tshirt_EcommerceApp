import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/products.css';
import { apiUrl } from '../utils/api';

const DEFAULT_CATEGORY_IMAGES = {
  all: '/category thumb/all product.png',
  tshirt: '/category thumb/t shirt.webp',
  hoodie: '/category thumb/hoodies.webp',
  shirt: '/category thumb/shirt.jpg',
};

const formatCategoryLabel = (value) =>
  String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function Products() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get('type') || 'all';

  useEffect(() => {
    fetch(apiUrl('/categories'))
      .then((res) => res.json())
      .then((data) => {
        setCategoryList(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategoryList([]));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const url = selectedType === 'all'
          ? apiUrl('/products')
          : apiUrl(`/products?type=${selectedType}`);

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

    fetchProducts();
  }, [selectedType]);

  const categories = [
    { label: 'All Products', value: 'all', image: DEFAULT_CATEGORY_IMAGES.all },
    ...categoryList.map((category) => ({
      label: category.name,
      value: category.slug,
      image: category.image || DEFAULT_CATEGORY_IMAGES[category.slug] || DEFAULT_CATEGORY_IMAGES.all,
    })),
  ];

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

      <h1>{selectedType === 'all' ? 'All Products' : formatCategoryLabel(selectedType)}</h1>

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
