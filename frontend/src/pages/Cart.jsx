import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openRazorpayCheckout } from '../utils/razorpay';
import { buildCustomizationPreview } from '../utils/customizationPreview';
import '../styles/cart.css';
import { apiUrl } from '../utils/api';

const TYPE_LABELS = {
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  shirt: 'Shirt',
};

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderingItemId, setOrderingItemId] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemPreviews, setSelectedItemPreviews] = useState({ front: '', back: '' });
  const navigate = useNavigate();
  const items = cart?.items || [];
  const outOfStockItems = items.filter((item) => item.productId?.isOutOfStock);
  const hasOutOfStockItems = outOfStockItems.length > 0;

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/cart'), { credentials: 'include' });

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
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    let isCancelled = false;

    const loadModalPreviews = async () => {
      if (!selectedItem) {
        setSelectedItemPreviews({ front: '', back: '' });
        return;
      }

      const front = selectedItem.previewImages?.front
        || await buildCustomizationPreview(selectedItem.productId, selectedItem.designJSON, 'front');
      const back = selectedItem.previewImages?.back
        || await buildCustomizationPreview(selectedItem.productId, selectedItem.designJSON, 'back');

      if (!isCancelled) {
        setSelectedItemPreviews({ front, back });
      }
    };

    loadModalPreviews();

    return () => {
      isCancelled = true;
    };
  }, [selectedItem]);

  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(apiUrl(`/cart/item/${itemId}`), {
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

  const handleQuantityChange = async (itemId, nextQuantity) => {
    try {
      const res = await fetch(apiUrl(`/cart/item/${itemId}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Math.max(1, nextQuantity) }),
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update quantity');
      }

      fetchCart();
    } catch (error) {
      alert(error.message || 'Failed to update quantity.');
    }
  };

  // Checkout ALL items via Razorpay
  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (hasOutOfStockItems) {
      alert('Remove out-of-stock products from your cart before checkout.');
      return;
    }

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
      const verifyRes = await fetch(apiUrl('/payment/verify'), {
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
    if (item.productId?.isOutOfStock) {
      alert('This product is out of stock and cannot be ordered.');
      return;
    }

    setOrderingItemId(item._id);
    try {
      const paymentResponse = await openRazorpayCheckout(
        item.productId.price * (item.quantity || 1),
        `${item.productId.name} x${item.quantity || 1}`
      );

      const verifyRes = await fetch(apiUrl('/payment/verify'), {
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
            previewImages: item.previewImages,
            material: item.material,
            quantity: item.quantity || 1,
          },
        }),
      });

      if (verifyRes.status === 401) {
        navigate('/login');
        return;
      }

      if (!verifyRes.ok) throw new Error('Payment verification failed');

      // Remove the ordered item from cart
      await fetch(apiUrl(`/cart/item/${item._id}`), {
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
          {hasOutOfStockItems && (
            <div className="cart__notice cart__notice--warning">
              Remove out-of-stock items before placing an order.
            </div>
          )}

          <div className="cart__items">
            {items.map((item) => (
              <article
                key={item._id}
                className="cart__item"
                onClick={() => setSelectedItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedItem(item);
                  }
                }}
              >
                <img src={item.previewImage} alt="design preview" className="cart__item-image" />

                <div className="cart__item-details">
                  <h4>{item.productId?.name}</h4>
                  <p>Rs {item.productId?.price}</p>
                  <p>Material: {item.material}</p>
                  <div className="cart__quantity" onClick={(event) => event.stopPropagation()}>
                    <span>Qty</span>
                    <div className="cart__quantity-controls">
                      <button
                        type="button"
                        className="cart__qty-btn"
                        onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(event) => handleQuantityChange(item._id, Number(event.target.value) || 1)}
                        className="cart__qty-input"
                      />
                      <button
                        type="button"
                        className="cart__qty-btn"
                        onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="cart__subtotal">Subtotal: Rs {(item.productId?.price || 0) * (item.quantity || 1)}</p>
                  {item.productId?.isOutOfStock && (
                    <p className="cart__stock cart__stock--out">Out of stock</p>
                  )}
                </div>

                <div className="cart__item-actions" onClick={(event) => event.stopPropagation()}>
                  <button className="cart__remove-btn" onClick={() => handleRemove(item._id)}>
                    Remove
                  </button>
                  <button
                    className="cart__edit-btn"
                    onClick={() =>
                      navigate(`/customize/${item.productId?._id}`, {
                        state: { cartItemId: item._id, cartItem: item },
                      })
                    }
                  >
                    Edit Design
                  </button>
                  <button
                    className="cart__order-btn"
                    onClick={() => handleOrderNow(item)}
                    disabled={orderingItemId === item._id || item.productId?.isOutOfStock}
                  >
                    {item.productId?.isOutOfStock
                      ? 'Unavailable'
                      : orderingItemId === item._id
                        ? 'Processing...'
                        : 'Order Now'}
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
              disabled={checkingOut || hasOutOfStockItems}
            >
              {hasOutOfStockItems ? 'Remove unavailable items' : checkingOut ? 'Processing...' : `Pay Rs ${total}`}
            </button>
          </div>

          {selectedItem && (
            <div className="cart-modal" onClick={() => setSelectedItem(null)} role="presentation">
              <div className="cart-modal__dialog" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="cart-modal__close" onClick={() => setSelectedItem(null)}>
                  Close
                </button>
                <div className="cart-modal__gallery">
                  <article>
                    <span>Front</span>
                    {selectedItemPreviews.front ? (
                      <img
                        src={selectedItemPreviews.front}
                        alt={`${selectedItem.productId?.name} front preview`}
                      />
                    ) : (
                      <div className="cart-modal__placeholder">Front preview not available</div>
                    )}
                  </article>
                  <article>
                    <span>Back</span>
                    {selectedItemPreviews.back ? (
                      <img
                        src={selectedItemPreviews.back}
                        alt={`${selectedItem.productId?.name} back preview`}
                      />
                    ) : (
                      <div className="cart-modal__placeholder">Back preview not available</div>
                    )}
                  </article>
                </div>
                <div className="cart-modal__details">
                  <h3>{selectedItem.productId?.name}</h3>
                  <p>{selectedItem.productId?.description || 'No product description available.'}</p>
                  <p><strong>Type:</strong> {TYPE_LABELS[selectedItem.productId?.type] || selectedItem.productId?.type || 'Product'}</p>
                  <p><strong>Price:</strong> Rs {selectedItem.productId?.price}</p>
                  <p><strong>Material:</strong> {selectedItem.material}</p>
                  <p><strong>Quantity:</strong> {selectedItem.quantity || 1}</p>
                  {selectedItem.productId?.isOutOfStock && (
                    <p className="cart__stock cart__stock--out">This product is currently out of stock.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Cart;
