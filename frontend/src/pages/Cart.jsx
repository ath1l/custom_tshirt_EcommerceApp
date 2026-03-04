import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.css';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderingItemId, setOrderingItemId] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await fetch('http://localhost:3000/cart', { credentials: 'include' });
      const data = await res.json();
      setCart(data);
    } catch {
      // keep previous cart state on fetch failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await fetch(`http://localhost:3000/cart/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCart();
    } catch {
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
      alert('All orders placed successfully!');
      navigate('/orders');
    } catch {
      alert('Checkout failed. Are you logged in?');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleOrderNow = async (item) => {
    if (!item?.productId?._id) return;

    setOrderingItemId(item._id);
    try {
      const orderRes = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId._id,
          designJSON: item.designJSON,
          previewImage: item.previewImage,
          material: item.material,
        }),
      });

      if (!orderRes.ok) throw new Error('Order failed');

      const removeRes = await fetch(`http://localhost:3000/cart/item/${item._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!removeRes.ok) throw new Error('Failed to update cart');

      await fetchCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch {
      alert('Failed to place this order. Please try again.');
    } finally {
      setOrderingItemId('');
    }
  };

  if (loading) return <p className="cart cart--loading">Loading cart...</p>;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);

  return (
    <section className="cart">
      <header className="cart__header">
        <h2>Your Cart</h2>
      </header>

      {items.length === 0 ? (
        <div className="cart__empty">
          <p>Your cart is empty.</p>
          <button className="cart__browse-btn" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="cart__items">
            {items.map((item) => (
              <article key={item._id} className="cart__item">
                <img src={item.previewImage} alt="design preview" className="cart__item-image" />

                <div className="cart__item-details">
                  <h4>{item.productId?.name}</h4>
                  <p>Rs {item.productId?.price}</p>
                  <p>Material: {item.material}</p>
                  <p>Qty: {item.quantity}</p>
                </div>

                <div className="cart__item-actions">
                  <button className="cart__remove-btn" onClick={() => handleRemove(item._id)}>
                    Remove
                  </button>
                  <button
                    className="cart__order-btn"
                    onClick={() => handleOrderNow(item)}
                    disabled={orderingItemId === item._id}
                  >
                    {orderingItemId === item._id ? 'Ordering...' : 'Order Now'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart__summary">
            <h3>Total: Rs {total}</h3>
            <button className="cart__checkout-btn" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Placing Orders...' : 'Checkout All'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;
