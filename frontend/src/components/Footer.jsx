import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const YEAR = new Date().getFullYear();

const BASE_NAV_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", to: "/products" },
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    fetch("http://localhost:3000/check-auth", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setIsAuthenticated(Boolean(data.isAuthenticated));
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const navColumns = [
    ...BASE_NAV_COLUMNS,
    {
      heading: "Account",
      links: isAuthenticated
        ? [
            { label: "Cart", to: "/cart" },
            { label: "My Orders", to: "/orders" },
            { label: "Profile", to: "/profile" },
          ]
        : [
            { label: "Login", to: "/login" },
            { label: "Register", to: "/register" },
          ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="/" className="footer__logo">
            Custo<span>Me</span>
          </a>
          <p className="footer__tagline">
            Your vision, your fabric, your rules. Design custom apparel that
            says exactly what you mean.
          </p>
        </div>

        {navColumns.map((col) => (
          <div key={col.heading} className="footer__col">
            <h4 className="footer__col-heading">{col.heading}</h4>
            <ul className="footer__col-links">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">(c) {YEAR} CustoMe. All rights reserved.</p>
        <p className="footer__made">
          Crafted with care for custom apparel lovers.
        </p>
      </div>
    </footer>
  );
}

