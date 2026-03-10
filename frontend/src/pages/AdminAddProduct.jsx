import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

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

      setSuccess(`Product "${data.name}" added successfully.`);
      setForm({ name: '', price: '', image: '', baseImage: '', description: '', type: 'tshirt' });
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Blue Hoodie' },
    { name: 'price', label: 'Price (Rs.)', type: 'number', placeholder: 'e.g. 699' },
    { name: 'image', label: 'Thumbnail Image Path', type: 'text', placeholder: '/products/black-thumb.png' },
    { name: 'baseImage', label: 'Base Canvas Image Path', type: 'text', placeholder: '/tshirts/black.png' },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description' },
  ];

  return (
    <main className="admin-page admin-page--narrow">
      <section className="admin-header">
        <h2>Add New Product</h2>
        <button onClick={() => navigate('/admin/orders')} className="admin-btn admin-btn--ghost" type="button">
          Back to Orders
        </button>
      </section>

      <section className="admin-form-card">
        {error && <p className="admin-message admin-message--error">{error}</p>}
        {success && <p className="admin-message admin-message--success">{success}</p>}

        <form onSubmit={handleSubmit} className="admin-form">
          {fields.map((field) => (
            <div key={field.name} className="admin-form__field">
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}

          <div className="admin-form__field">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="tshirt">T-Shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="shirt">Shirt</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminAddProduct;
