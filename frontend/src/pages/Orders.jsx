import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/orders", {
      credentials: "include", // 🔑 VERY IMPORTANT
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <h4>{order.productId?.name}</h4>
            <p>Price: ₹{order.productId?.price}</p>
            <p>Material: {order.customization?.material || 'Cotton'}</p>

            <img
              src={order.customization.previewImage}
              alt="T-shirt preview"
              style={{
                width: "200px",
                display: "block",
                marginTop: "10px",
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
