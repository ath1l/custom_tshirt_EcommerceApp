import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();

  const categories = [
    {
      label: 'T-Shirts',
      value: 'tshirt',
      desc: 'Daily essentials with premium cotton comfort.',
      image: '/category thumb/t shirt.webp',
    },
    {
      label: 'Hoodies',
      value: 'hoodie',
      desc: 'Warm layers for streetwear and casual fits.',
      image: '/category thumb/hoodies.webp',
    },
    {
      label: 'Shirts',
      value: 'shirt',
      desc: 'Smart casual styles with clean finishing.',
      image: '/category thumb/shirt.jpg',
    },
  ];

  return (
    <main className="home">
      <section className="home__hero">
        <p className="home__tag">Design. Wear. Repeat.</p>
        <h1 className="home__title">Premium Custom Apparel for Every Style</h1>
        <p className="home__subtitle">
          Explore curated T-shirts, hoodies, and shirts built for customization and comfort.
          Create looks that represent your brand, team, or personal identity.
        </p>

        <div className="home__hero-actions">
          <button className="home__btn home__btn--primary" onClick={() => navigate('/products')}>
            Explore Collection
          </button>
        </div>

        <div className="home__stats">
          <article>
            <h3>1500+</h3>
            <p>Custom orders completed</p>
          </article>
          <article>
            <h3>98%</h3>
            <p>Positive customer feedback</p>
          </article>
          <article>
            <h3>24/7</h3>
            <p>Quick support for your orders</p>
          </article>
        </div>
      </section>

      <section className="home__categories">
        <div className="home__section-head">
          <h2>Shop by Category</h2>
          <p>Pick your base style and customize it the way you want.</p>
        </div>

        <div className="home__category-grid">
          {categories.map((cat) => (
            <article key={cat.value} className="home__category-card">
              <img
                src={cat.image}
                alt={cat.label}
                className="home__category-image"
                loading="lazy"
              />
              <h3>{cat.label}</h3>
              <p>{cat.desc}</p>
              <button onClick={() => navigate(`/products?type=${cat.value}`)}>View {cat.label}</button>
            </article>
          ))}
        </div>

        <div className="home__more-categories">
          <p>For more categories, explore our full catalog.</p>
          <button onClick={() => navigate('/products')}>View All Categories</button>
        </div>
      </section>
    </main>
  );
}

export default Home;
