import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const categories = [
    { label: 'T-Shirts', value: 'tshirt' },
    { label: 'Hoodies', value: 'hoodie' },
    { label: 'Shirts', value: 'shirt' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome to the T-Shirt Store</h2>
      <p>Browse by category:</p>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={() => navigate('/products')}>All Products</button>
        {categories.map((cat) => (
          <button key={cat.value} onClick={() => navigate(`/products?type=${cat.value}`)}>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
