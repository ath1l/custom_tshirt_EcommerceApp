import { apiUrl } from './api';

/**
 * Dynamically loads the Razorpay checkout SDK from their CDN.
 * Safe to call multiple times — returns immediately if already loaded.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Full Razorpay flow:
 *  1. Ask backend to create a Razorpay order (gets orderId + key)
 *  2. Open the Razorpay payment modal
 *  3. Resolve with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *     so the caller can POST /payment/verify
 *
 * @param {number}  amount      – total in ₹
 * @param {string}  description – shown inside the modal
 * @returns {Promise<object>}   – payment response from Razorpay
 */
export async function openRazorpayCheckout(amount, description = 'Custom Apparel Order') {
  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error('Failed to load Razorpay SDK');

  // 1. Create order on backend
  const res = await fetch(apiUrl('/payment/create-order'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Could not create payment order');
  }

  const { orderId, key } = await res.json();

  // 2. Open modal — wraps callback API in a Promise
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key,
      order_id: orderId,
      name: 'CustoMe',
      description,
      currency: 'INR',
      handler(response) {
        resolve(response); // { razorpay_order_id, razorpay_payment_id, razorpay_signature }
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled'));
        },
      },
      theme: { color: '#a8c3a0' },
    });

    rzp.open();
  });
}
