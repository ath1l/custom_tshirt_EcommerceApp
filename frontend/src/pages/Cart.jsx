import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const fetchCart = () => {
    fetch('http://localhost:3000/cart', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { setCart(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (itemId) => {
    try {
      await fetch(`http://localhost:3000/cart/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCart(); // refresh
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('http://localhost:3000/cart/checkout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Checkout failed');
      alert('🎉 All orders placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert('Checkout failed. Are you logged in?');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading cart...</p>;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Your Cart 🛒</h2>

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <>
          {items.map(item => (
            <div
              key={item._id}
              style={{
                display: 'flex',
                gap: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                alignItems: 'center',
              }}
            >
              {/* Preview */}
              <img
                src={item.previewImage}
                alt="design preview"
                style={{ width: '120px', height: '120px', objectFit: 'contain', border: '1px solid #eee' }}
              />

              {/* Details */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 6px' }}>{item.productId?.name}</h4>
                <p style={{ margin: '0 0 4px', color: '#555' }}>₹{item.productId?.price}</p>
                <p style={{ margin: '0 0 4px', color: '#555' }}>Material: {item.material}</p>
                <p style={{ margin: '0 0 4px', color: '#555' }}>Qty: {item.quantity}</p>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(item._id)}
                style={{
                  background: '#e44',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Summary */}
          <div style={{
            borderTop: '2px solid #ccc',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3>Total: ₹{total}</h3>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                padding: '12px 28px',
                fontSize: '16px',
                background: '#2a2',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              {checkingOut ? 'Placing Orders...' : 'Checkout All →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;