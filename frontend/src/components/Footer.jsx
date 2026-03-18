import "../styles/footer.css";

const YEAR = new Date().getFullYear();

const NAV_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Customize", to: "/#customize" },
      { label: "Cart", to: "/#cart" },
      { label: "My Orders", to: "/#orders" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Login", to: "/#login" },
      { label: "Register", to: "/#register" },
      { label: "Profile", to: "/#profile" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/info#about" },
      { label: "Contact", to: "/info#contact" },
      { label: "Privacy Policy", to: "/info#privacy" },
      { label: "Terms of Service", to: "/info#terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* ── top strip ── */}
      <div className="footer__inner">

        {/* brand block */}
        <div className="footer__brand">
          <a href="/" className="footer__logo">
            Custo<span>Me</span>
          </a>
          <p className="footer__tagline">
            Your vision, your fabric, your rules. Design custom apparel that
            says exactly what you mean.
          </p> 
        </div>

        {/* nav columns */}
        {NAV_COLUMNS.map((col) => (
          <div key={col.heading} className="footer__col">
            <h4 className="footer__col-heading">{col.heading}</h4>
            <ul className="footer__col-links">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.to} className="footer__link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── bottom bar ── */}
      <div className="footer__bottom">
        <p className="footer__copy">
          © {YEAR} CustoMe. All rights reserved.
        </p>
        <p className="footer__made">
          Crafted with care for custom apparel lovers.
        </p>
      </div>
    </footer>
  );
}
