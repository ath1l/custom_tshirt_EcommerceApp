// frontend/src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders', {
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('Orders:', data); // Debug
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading your orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
              <h3>Order #{order._id.slice(-6)}</h3>
              
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              
              <p><strong>Status:</strong> {order.status}</p>
              
              <p><strong>Product:</strong> {order.product?.name || 'Unknown'}</p>
              
              <p><strong>Quantity:</strong> {order.quantity}</p>
              
              <p><strong>Price:</strong> ${order.priceAtPurchase}</p>
              
              <p><strong>Total:</strong> ${order.priceAtPurchase * order.quantity}</p>
              
              {order.customization && (
                <div>
                  <strong>Customization:</strong>
                  {order.customization.color && <p>Color: {order.customization.color}</p>}
                  {order.customization.size && <p>Size: {order.customization.size}</p>}
                  {order.customization.text && <p>Text: {order.customization.text}</p>}
                  {order.customization.image && <p>Image: {order.customization.image}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;