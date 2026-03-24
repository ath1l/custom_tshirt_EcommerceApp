import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/admin/orders', { credentials: 'include' }),
      fetch('http://localhost:3000/products'),
    ])
      .then(async ([ordersRes, productsRes]) => {
        if (ordersRes.status === 403) throw new Error('Access denied');
        if (ordersRes.status === 401) throw new Error('Not logged in');

        const ordersData = await ordersRes.json();
        const productsData = productsRes.ok ? await productsRes.json() : [];

        setOrders(ordersData);
        setProductCount(Array.isArray(productsData) ? productsData.length : 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <main className="admin-page admin-page--message">Loading...</main>;
  if (error) return <main className="admin-page admin-page--message">Error: {error}</main>;

  const deliveredOrders = orders.filter((order) => String(order.status).toLowerCase() === 'delivered').length;
  const pendingOrders = orders.filter((order) => String(order.status).toLowerCase() !== 'delivered').length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const stats = [
    { label: 'Total Orders', value: orders.length, tone: 'primary' },
    { label: 'Delivered', value: deliveredOrders, tone: 'success' },
    { label: 'Pending', value: pendingOrders, tone: 'warning' },
    { label: 'Products', value: productCount, tone: 'neutral' },
    { label: 'Revenue', value: `Rs. ${totalRevenue}`, tone: 'primary' },
  ];

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`http://localhost:3000/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      const updatedOrder = await res.json();
      setOrders((current) =>
        current.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Admin dashboard</p>
          <h2>Orders Overview</h2>
        </div>
        <div className="admin-header__actions">
          <button onClick={() => navigate('/admin/products')} className="admin-btn admin-btn--ghost" type="button">
            Manage Products
          </button>
          <button onClick={() => navigate('/admin/products/new')} className="admin-btn admin-btn--primary" type="button">
            Add New Product
          </button>
        </div>
      </section>

      <section className="admin-stats">
        {stats.map((stat) => (
          <article key={stat.label} className={`admin-stat-card admin-stat-card--${stat.tone}`}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      {orders.length === 0 ? (
        <section className="admin-empty">No orders yet.</section>
      ) : (
        <section className="admin-list">
          {orders.map((order) => (
            <article key={order._id} className="admin-order-card">
              <div className="admin-order-card__content">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>User:</strong> {order.userId?.username} ({order.userId?.email})</p>
                <p><strong>Product:</strong> {order.productId?.name}</p>
                <p><strong>Price:</strong> Rs. {order.totalPrice}</p>
                <p><strong>Material:</strong> {order.customization?.material}</p>
                <div className="admin-order-card__status-row">
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`admin-status-badge admin-status-badge--${String(order.status).toLowerCase()}`}>
                      {order.status}
                    </span>
                  </p>
                  <div className="admin-order-card__status-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => handleStatusChange(order._id, 'pending')}
                      disabled={updatingOrderId === order._id || order.status === 'pending'}
                    >
                      Mark Pending
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary"
                      onClick={() => handleStatusChange(order._id, 'delivered')}
                      disabled={updatingOrderId === order._id || order.status === 'delivered'}
                    >
                      {updatingOrderId === order._id ? 'Updating...' : 'Mark Delivered'}
                    </button>
                  </div>
                </div>
                <p><strong>Ordered at:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="admin-order-card__image-shell">
                <img src={order.customization?.previewImage} alt="preview" className="admin-order-card__image" />
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminOrders;
