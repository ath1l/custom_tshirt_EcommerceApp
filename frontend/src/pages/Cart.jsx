import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.css';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const fetchCart = () => {
    fetch('http://localhost:3000/cart', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

                <button className="cart__remove-btn" onClick={() => handleRemove(item._id)}>
                  Remove
                </button>
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
