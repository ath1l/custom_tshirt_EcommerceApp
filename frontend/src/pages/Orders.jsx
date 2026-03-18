import { useEffect, useState } from "react";
import { buildCustomizationPreview } from "../utils/customizationPreview";
import "../styles/orders.css";

const TYPE_LABELS = {
  tshirt: "T-Shirt",
  hoodie: "Hoodie",
  shirt: "Shirt",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderPreviews, setSelectedOrderPreviews] = useState({ front: '', back: '' });

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

  useEffect(() => {
    let isCancelled = false;

    const loadModalPreviews = async () => {
      if (!selectedOrder) {
        setSelectedOrderPreviews({ front: '', back: '' });
        return;
      }

      const front = selectedOrder.customization?.previewImages?.front
        || await buildCustomizationPreview(selectedOrder.productId, selectedOrder.customization?.designJSON, 'front');
      const back = selectedOrder.customization?.previewImages?.back
        || await buildCustomizationPreview(selectedOrder.productId, selectedOrder.customization?.designJSON, 'back');

      if (!isCancelled) {
        setSelectedOrderPreviews({ front, back });
      }
    };

    loadModalPreviews();

    return () => {
      isCancelled = true;
    };
  }, [selectedOrder]);

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
            <article
              key={order._id}
              className="orders-card"
              onClick={() => setSelectedOrder(order)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setSelectedOrder(order);
                }
              }}
            >
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

      {selectedOrder && (
        <div className="orders-modal" onClick={() => setSelectedOrder(null)} role="presentation">
          <div className="orders-modal__dialog" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="orders-modal__close" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
            <div className="orders-modal__gallery">
              <article>
                <span>Front</span>
                {selectedOrderPreviews.front ? (
                  <img
                    src={selectedOrderPreviews.front}
                    alt={`${selectedOrder.productId?.name} front preview`}
                  />
                ) : (
                  <div className="orders-modal__placeholder">Front preview not available</div>
                )}
              </article>
              <article>
                <span>Back</span>
                {selectedOrderPreviews.back ? (
                  <img
                    src={selectedOrderPreviews.back}
                    alt={`${selectedOrder.productId?.name} back preview`}
                  />
                ) : (
                  <div className="orders-modal__placeholder">Back preview not available</div>
                )}
              </article>
            </div>
            <div className="orders-modal__details">
              <h3>{selectedOrder.productId?.name}</h3>
              <p>{selectedOrder.productId?.description || 'No product description available.'}</p>
              <p><strong>Type:</strong> {TYPE_LABELS[selectedOrder.productId?.type] || selectedOrder.productId?.type || 'Product'}</p>
              <p><strong>Price:</strong> Rs. {selectedOrder.productId?.price}</p>
              <p><strong>Material:</strong> {selectedOrder.customization?.material || 'Cotton'}</p>
              <p><strong>Quantity:</strong> {selectedOrder.quantity || 1}</p>
              <p><strong>Status:</strong> {selectedOrder.status || 'pending'}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Orders;
