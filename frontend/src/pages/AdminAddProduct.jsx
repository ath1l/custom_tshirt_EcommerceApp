import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const EMPTY_FORM = {
  name: '',
  price: '',
  image: '',
  baseImage: '',
  galleryImages: '',
  description: '',
  type: 'tshirt',
  isOutOfStock: false,
};

const parseGalleryImages = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .map((item) => {
      if (!item) return '';
      if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('/')) {
        return item;
      }
      return `/${item}`;
    })
    .filter(Boolean);

function AdminAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          galleryImages: parseGalleryImages(form.galleryImages),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Product "${data.name}" added successfully.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Blue Hoodie' },
    { name: 'price', label: 'Price (Rs.)', type: 'number', placeholder: 'e.g. 699' },
    {
      name: 'image',
      label: 'Thumbnail Image Path',
      type: 'text',
      placeholder: '/apparel/thumbnails/black-thumb.png',
    },
    {
      name: 'baseImage',
      label: 'Base Canvas Image Path',
      type: 'text',
      placeholder: '/apparel/editor/black.png',
    },
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
            <label>Extra Gallery Images</label>
            <textarea
              name="galleryImages"
              value={form.galleryImages}
              onChange={handleChange}
              placeholder={'apparel/gallery/blue-hoodie-side.png\napparel/gallery/blue-hoodie-back.png'}
              rows={5}
            />
            <small className="admin-form__hint">
              Use `frontend/public/apparel/thumbnails` for product cards, `frontend/public/apparel/editor` for
              customization images, and `frontend/public/apparel/gallery` for extra detail images.
            </small>
          </div>

          <div className="admin-form__field">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="tshirt">T-Shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="shirt">Shirt</option>
            </select>
          </div>

          <label className="admin-form__checkbox">
            <input
              type="checkbox"
              name="isOutOfStock"
              checked={form.isOutOfStock}
              onChange={handleChange}
            />
            <span>Mark this product as out of stock</span>
          </label>

          <button type="submit" disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminAddProduct;
