import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/admin/orders', { credentials: 'include' })
      .then(res => {
        if (res.status === 403) throw new Error('Access denied');
        if (res.status === 401) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => { setOrders(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Orders (Admin)</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
  <button onClick={() => navigate('/admin/products')}>
    Manage Products
  </button>
  <button onClick={() => navigate('/admin/products/new')}>
    + Add New Product
  </button>
</div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>User:</strong> {order.userId?.username} ({order.userId?.email})</p>
            <p><strong>Product:</strong> {order.productId?.name}</p>
            <p><strong>Price:</strong> ₹{order.totalPrice}</p>
            <p><strong>Material:</strong> {order.customization?.material}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Ordered at:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <img
              src={order.customization?.previewImage}
              alt="preview"
              style={{ width: '150px', marginTop: '10px' }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;