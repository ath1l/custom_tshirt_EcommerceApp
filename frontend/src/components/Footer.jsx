import { Link } from "react-router-dom";
import "../styles/footer.css";

const YEAR = new Date().getFullYear();

const NAV_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Customize", to: "/products" },
      { label: "Cart", to: "/cart" },
      { label: "My Orders", to: "/orders" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/" },
      { label: "Contact", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Terms of Service", to: "/" },
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
          <Link to="/" className="footer__logo">
            Custo<span>Me</span>
          </Link>
          <p className="footer__tagline">
            Your vision, your fabric, your rules. Design custom apparel that
            says exactly what you mean.
          </p>

          {/* social icons (SVG-only, no external deps) */}
          <div className="footer__socials">
            <a href="#" aria-label="Instagram" className="footer__social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter / X" className="footer__social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="footer__social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* nav columns */}
        {NAV_COLUMNS.map((col) => (
          <div key={col.heading} className="footer__col">
            <h4 className="footer__col-heading">{col.heading}</h4>
            <ul className="footer__col-links">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer__link">{l.label}</Link>
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