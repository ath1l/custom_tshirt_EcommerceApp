import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudinaryUploadField from '../components/CloudinaryUploadField';
import '../styles/admin.css';
import { apiUrl } from '../utils/api';

const createEmptyForm = (categorySlug = '') => ({
  name: '',
  price: '',
  image: '',
  baseImage: '',
  backImage: '',
  galleryImages: '',
  description: '',
  type: categorySlug,
  isOutOfStock: false,
});

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
  const [form, setForm] = useState(createEmptyForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(apiUrl('/categories'))
      .then((res) => res.json())
      .then((data) => {
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);
        const fallbackCategory = nextCategories[0]?.slug || '';
        setForm((current) => ({
          ...current,
          type: nextCategories.some((category) => category.slug === current.type) ? current.type : fallbackCategory,
        }));
      })
      .catch(() => setCategories([]));
  }, []);

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
      const res = await fetch(apiUrl('/admin/products'), {
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
      setForm(createEmptyForm(categories[0]?.slug || ''));
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
      required: true,
    },
    {
      name: 'baseImage',
      label: 'Base Canvas Image Path',
      type: 'text',
      placeholder: '/apparel/editor/black.png',
      required: true,
    },
    {
      name: 'backImage',
      label: 'Back Canvas Image Path',
      type: 'text',
      placeholder: '/apparel/editor back/black.png',
      required: false,
    },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Short description', required: true },
  ];

  return (
    <main className="admin-page admin-page--narrow">
      <section className="admin-header">
        <h2>Add New Product</h2>
        <div className="admin-header__actions">
          <button onClick={() => navigate('/admin/categories')} className="admin-btn admin-btn--ghost" type="button">
            Manage Categories
          </button>
          <button onClick={() => navigate('/admin/orders')} className="admin-btn admin-btn--ghost" type="button">
            Back to Orders
          </button>
        </div>
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
                required={field.required}
              />
            </div>
          ))}

          <CloudinaryUploadField
            label="Upload Thumbnail to Cloudinary"
            onUploaded={(url) => setForm((current) => ({ ...current, image: url }))}
          />

          <CloudinaryUploadField
            label="Upload Front Base Image"
            onUploaded={(url) => setForm((current) => ({ ...current, baseImage: url }))}
          />

          <CloudinaryUploadField
            label="Upload Back Base Image"
            onUploaded={(url) => setForm((current) => ({ ...current, backImage: url }))}
          />

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
              front customization images, `frontend/public/apparel/editor back` for back customization images, and
              `frontend/public/apparel/gallery` for extra detail images.
            </small>
          </div>

          <CloudinaryUploadField
            label="Upload Gallery Images"
            multiple
            onUploaded={(urls) =>
              setForm((current) => ({
                ...current,
                galleryImages: [...current.galleryImages.split('\n').filter(Boolean), ...urls].join('\n'),
              }))
            }
          />

          <div className="admin-form__field">
            <label>Category</label>
            <select name="type" value={form.type} onChange={handleChange} required disabled={categories.length === 0}>
              {categories.length === 0 && <option value="">Add a category first</option>}
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>{category.name}</option>
              ))}
            </select>
            <small className="admin-form__hint">Categories are managed separately so each one can include its own thumbnail.</small>
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

          <button type="submit" disabled={loading || categories.length === 0} className="admin-btn admin-btn--primary">
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminAddProduct;
