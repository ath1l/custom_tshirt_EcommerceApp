import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const toLocalDateInputValue = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const shiftLocalDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateInputValue(date);
};

const getLocalDateString = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return toLocalDateInputValue(date);
};

const compareDates = (left, right) => left.localeCompare(right);

function AdminInsights() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => shiftLocalDate(-6));
  const [endDate, setEndDate] = useState(() => toLocalDateInputValue());

  useEffect(() => {
    fetch('http://localhost:3000/admin/orders', { credentials: 'include' })
      .then(async (ordersRes) => {
        if (ordersRes.status === 403) throw new Error('Access denied');
        if (ordersRes.status === 401) throw new Error('Not logged in');

        const ordersData = await ordersRes.json();

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <main className="admin-page admin-page--message">Loading insights...</main>;
  if (error) return <main className="admin-page admin-page--message">Error: {error}</main>;

  const normalizedStartDate = compareDates(startDate, endDate) <= 0 ? startDate : endDate;
  const normalizedEndDate = compareDates(startDate, endDate) <= 0 ? endDate : startDate;

  const filteredOrders = orders.filter((order) => {
    const orderDate = getLocalDateString(order.createdAt);
    return orderDate >= normalizedStartDate && orderDate <= normalizedEndDate;
  });
  const deliveredOrders = filteredOrders.filter((order) => String(order.status).toLowerCase() === 'delivered').length;
  const pendingOrders = filteredOrders.filter((order) => String(order.status).toLowerCase() !== 'delivered').length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const uniqueCustomers = new Set(filteredOrders.map((order) => order.userId?._id || order.userId?.email || order.userId)).size;
  const chartData = [
    { label: 'Pending', value: pendingOrders, tone: 'warning' },
    { label: 'Delivered', value: deliveredOrders, tone: 'success' },
  ];
  const totalChartValue = Math.max(1, pendingOrders + deliveredOrders);

  const stats = [
    { label: 'Orders in Range', value: filteredOrders.length, tone: 'primary' },
    { label: 'Delivered', value: deliveredOrders, tone: 'success' },
    { label: 'Pending', value: pendingOrders, tone: 'warning' },
    { label: 'Revenue', value: `Rs. ${totalRevenue}`, tone: 'primary' },
    { label: 'Customers', value: uniqueCustomers, tone: 'neutral' },
  ];

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Admin dashboard</p>
          <h2>Insights by Date</h2>
        </div>
        <div className="admin-header__actions">
          <button onClick={() => navigate('/admin/orders')} className="admin-btn admin-btn--ghost" type="button">
            Orders
          </button>
          <button onClick={() => navigate('/admin/products')} className="admin-btn admin-btn--ghost" type="button">
            Products
          </button>
          <button onClick={() => navigate('/admin/categories')} className="admin-btn admin-btn--ghost" type="button">
            Categories
          </button>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-insights__controls">
          <div className="admin-form__field">
            <label>Start date</label>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="admin-form__field">
            <label>End date</label>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
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

      <section className="admin-form-card">
        <div className="admin-section-heading">
          <div>
            <p className="admin-header__eyebrow">Chart</p>
            <h3>Order status breakdown</h3>
          </div>
          <p className="admin-section-heading__meta">
            Range: <strong>{normalizedStartDate}</strong> to <strong>{normalizedEndDate}</strong>
          </p>
        </div>
        <div className="admin-chart-card" role="img" aria-label="Bar chart showing pending and delivered orders">
          <div className="admin-chart-card__plot">
            <div className="admin-chart-card__axis admin-chart-card__axis--y">
              {[100, 80, 60, 40, 20, 0].map((tick) => (
                <span key={tick}>{tick}%</span>
              ))}
            </div>
            <div className="admin-chart-card__bars">
              {chartData.map((item) => {
                const percentage = Math.round((item.value / totalChartValue) * 100);
                const height = `${percentage}%`;
                return (
                  <div key={item.label} className="admin-chart-card__bar-group">
                    <div className="admin-chart-card__value">{percentage}%</div>
                    <div className="admin-chart-card__bar-shell">
                      <div
                        className={`admin-chart-card__bar admin-chart-card__bar--${item.tone}`}
                        style={{ height }}
                        title={`${item.label}: ${item.value} orders (${percentage}%)`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {filteredOrders.length === 0 ? (
        <section className="admin-empty">No orders found for the selected date range.</section>
      ) : (
        <section className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    <strong>{order.userId?.username || 'Unknown user'}</strong>
                    <p className="admin-table__sub">{order.userId?.email}</p>
                  </td>
                  <td>{order.productId?.name || 'Unknown product'}</td>
                  <td>
                    <span className={`admin-status-badge admin-status-badge--${String(order.status).toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>Rs. {order.totalPrice}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default AdminInsights;
