import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openRazorpayCheckout } from '../utils/razorpay';
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

      if (res.status === 401) {
        // not logged in, send straight to login page
        navigate('/login');
        return;
      }

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
      const res = await fetch(`http://localhost:3000/cart/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      fetchCart();
    } catch {
      alert('Failed to remove item');
    }
  };

  // Checkout ALL items via Razorpay
  const handleCheckout = async () => {
    const items = cart?.items || [];
    if (items.length === 0) return;

    const total = items.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * (item.quantity || 1),
      0
    );

    setCheckingOut(true);
    try {
      const paymentResponse = await openRazorpayCheckout(
        total,
        `Cart checkout – ${items.length} item(s)`
      );

      // Verify on backend & create orders
      const verifyRes = await fetch('http://localhost:3000/payment/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentResponse, type: 'cart' }),
      });

      if (verifyRes.status === 401) {
        navigate('/login');
        return;
      }

      if (!verifyRes.ok) throw new Error('Payment verification failed');

      alert('All orders placed successfully!');
      navigate('/orders');
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        alert(err.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setCheckingOut(false);
    }
  };

  // Order a SINGLE cart item via Razorpay
  const handleOrderNow = async (item) => {
    if (!item?.productId?._id) return;

    setOrderingItemId(item._id);
    try {
      const paymentResponse = await openRazorpayCheckout(
        item.productId.price,
        item.productId.name
      );

      const verifyRes = await fetch('http://localhost:3000/payment/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentResponse,
          type: 'single',
          singleItem: {
            productId: item.productId._id,
            designJSON: item.designJSON,
            previewImage: item.previewImage,
            material: item.material,
          },
        }),
      });

      if (verifyRes.status === 401) {
        navigate('/login');
        return;
      }

      if (!verifyRes.ok) throw new Error('Payment verification failed');

      // Remove the ordered item from cart
      await fetch(`http://localhost:3000/cart/item/${item._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      await fetchCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        alert(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setOrderingItemId('');
    }
  };

  if (loading) return <p className="cart cart--loading">Loading cart...</p>;

  const items = cart?.items || [];
  const total = items.reduce(
    (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
    0
  );

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
                    {orderingItemId === item._id ? 'Processing...' : 'Order Now'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart__summary">
            <h3>Total: Rs {total}</h3>
            <button
              className="cart__checkout-btn"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : `Pay Rs ${total}`}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;