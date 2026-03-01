import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    image: '',
    baseImage: '',
    description: '',
    type: 'tshirt',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`✅ Product "${data.name}" added successfully!`);
      setForm({ name: '', price: '', image: '', baseImage: '', description: '', type: 'tshirt' });
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Blue Hoodie' },
    { name: 'price', label: 'Price (₹)', type: 'number', placeholder: 'e.g. 699' },
    { name: 'image', label: 'Thumbnail Image Path', type: 'text', placeholder: '/products/blue-thumb.png' },
    { name: 'baseImage', label: 'Base Canvas Image Path', type: 'text', placeholder: '/tshirts/blue.png' },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Add New Product</h2>
      <button onClick={() => navigate('/admin/orders')} style={{ marginBottom: '16px' }}>
        ← Back to Orders
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {fields.map(f => (
          <div key={f.name} style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              required
              style={{ width: '100%', padding: '6px' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Type</label>
          <select name="type" value={form.type} onChange={handleChange} style={{ width: '100%', padding: '6px' }}>
            <option value="tshirt">T-Shirt</option>
            <option value="hoodie">Hoodie</option>
            <option value="shirt">Shirt</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default AdminAddProduct;