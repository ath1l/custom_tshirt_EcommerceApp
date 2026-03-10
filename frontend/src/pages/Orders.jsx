import { useEffect, useState } from "react";
import "../styles/orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/orders", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="orders-page orders-page--message">Loading orders...</main>;
  }

  return (
    <main className="orders-page">
      <section className="orders-header">
        <h2>My Orders</h2>
      </section>

      {orders.length === 0 ? (
        <section className="orders-empty">
          <p>You haven't placed any orders yet.</p>
        </section>
      ) : (
        <section className="orders-grid">
          {orders.map((order) => (
            <article key={order._id} className="orders-card">
              <div className="orders-card__image-shell">
                <img
                  src={order.customization.previewImage}
                  alt="T-shirt preview"
                  className="orders-card__image"
                />
              </div>
              <div className="orders-card__content">
                <p className={`orders-card__status orders-card__status--${String(order.status).toLowerCase()}`}>
                  {order.status || 'pending'}
                </p>
                <h4>{order.productId?.name}</h4>
                <p className="orders-card__price">Rs. {order.productId?.price}</p>
                <p className="orders-card__meta">Material: {order.customization?.material || "Cotton"}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Orders;
