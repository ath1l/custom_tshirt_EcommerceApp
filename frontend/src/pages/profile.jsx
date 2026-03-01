import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

function Profile() {
  const [data, setData] = useState({
    loading: true,
    error: "",
    user: null,
    orders: [],
    cartItems: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [authRes, cartRes, ordersRes] = await Promise.all([
          fetch("http://localhost:3000/check-auth", { credentials: "include" }),
          fetch("http://localhost:3000/cart", { credentials: "include" }),
          fetch("http://localhost:3000/orders", { credentials: "include" }),
        ]);

        const auth = await authRes.json();
        if (!auth?.isAuthenticated) return navigate("/login");

        const cart = cartRes.ok ? await cartRes.json() : { items: [] };
        const orders = ordersRes.ok ? await ordersRes.json() : [];

        setData({
          loading: false,
          error: "",
          user: auth.user,
          cartItems: cart.items || [],
          orders: Array.isArray(orders) ? orders : [],
        });
      } catch {
        setData((prev) => ({ ...prev, loading: false, error: "Failed to load profile details." }));
      }
    })();
  }, [navigate]);

  const initial = useMemo(
    () => (data.user?.username?.[0] || "U").toUpperCase(),
    [data.user]
  );

  const cartTotal = useMemo(
    () =>
      data.cartItems.reduce(
        (sum, item) =>
          sum + (item.productId?.price || 0) * (item.quantity || 1),
        0
      ),
    [data.cartItems]
  );

  if (data.loading) return <div className="profile-page">Loading profile...</div>;
  if (data.error) return <div className="profile-page">{data.error}</div>;

  return (
    <section className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>
        <div>
          <h2 className="profile-name">{data.user?.username || "User"}</h2>
          <p className="profile-email">{data.user?.email || "No email found"}</p>
        </div>
      </div>

      <div className="profile-grid">
        <article className="profile-panel">
          <h3>Cart</h3>
          <p><strong>Items:</strong> {data.cartItems.length}</p>
          <p><strong>Total:</strong> Rs {cartTotal}</p>
          <button className="profile-btn" onClick={() => navigate("/cart")}>
            View Cart
          </button>
        </article>

        <article className="profile-panel">
          <h3>Orders</h3>
          <p><strong>Total Orders:</strong> {data.orders.length}</p>
          <button className="profile-btn" onClick={() => navigate("/orders")}>
            View Orders
          </button>
        </article>
      </div>

      <article className="profile-panel">
        <h3>Recent Orders</h3>
        {!data.orders.length ? (
          <p>No orders yet.</p>
        ) : (
          <ul className="profile-list">
            {data.orders.slice(0, 5).map((o) => (
              <li key={o._id} className="profile-list-item">
                <span>{o.productId?.name || "Custom T-Shirt"}</span>
                <span>Rs {o.totalPrice || o.productId?.price || 0}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

export default Profile;