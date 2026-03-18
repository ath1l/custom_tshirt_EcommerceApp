import { Fragment, useEffect, useState } from 'react';
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

const formatCategoryLabel = (value) =>
  String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

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

function ProductForm({ values, onChange, onSubmit, onCancel, error, loading, submitLabel, categories }) {
  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    { name: 'price', label: 'Price (Rs.)', type: 'number', required: true },
    { name: 'image', label: 'Thumbnail Image Path', type: 'text', required: true },
    { name: 'baseImage', label: 'Base Canvas Image Path', type: 'text', required: true },
    { name: 'backImage', label: 'Back Canvas Image Path', type: 'text', required: false },
    { name: 'description', label: 'Description', type: 'text', required: true },
  ];

  return (
    <form onSubmit={onSubmit} className="admin-form admin-form--embedded">
      {fields.map((field) => (
        <div key={field.name} className="admin-form__field">
          <label>{field.label}</label>
          <input type={field.type} name={field.name} value={values[field.name]} onChange={onChange} required={field.required} />
        </div>
      ))}

      <CloudinaryUploadField
        label="Upload Thumbnail to Cloudinary"
        onUploaded={(url) => onChange({ target: { name: 'image', value: url, type: 'text' } })}
      />

      <CloudinaryUploadField
        label="Upload Front Base Image"
        onUploaded={(url) => onChange({ target: { name: 'baseImage', value: url, type: 'text' } })}
      />

      <CloudinaryUploadField
        label="Upload Back Base Image"
        onUploaded={(url) => onChange({ target: { name: 'backImage', value: url, type: 'text' } })}
      />

      <div className="admin-form__field">
        <label>Extra Gallery Images</label>
        <textarea
          name="galleryImages"
          value={values.galleryImages}
          onChange={onChange}
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
          onChange({
            target: {
              name: 'galleryImages',
              value: [...values.galleryImages.split('\n').filter(Boolean), ...urls].join('\n'),
              type: 'text',
            },
          })
        }
      />

      <div className="admin-form__field">
        <label>Category</label>
        <select name="type" value={values.type} onChange={onChange} required disabled={categories.length === 0}>
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
          checked={values.isOutOfStock}
          onChange={onChange}
        />
        <span>Mark this product as out of stock</span>
      </label>

      {error && <p className="admin-message admin-message--error">{error}</p>}

      <div className="admin-header__actions">
        <button type="submit" disabled={loading || categories.length === 0} className="admin-btn admin-btn--primary">
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="admin-btn admin-btn--ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm());
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(createEmptyForm());
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch(apiUrl('/products'))
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch(apiUrl('/categories'))
      .then((res) => res.json())
      .then((data) => {
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);
        const fallbackCategory = nextCategories[0]?.slug || '';
        setAddForm((current) => ({
          ...current,
          type: nextCategories.some((category) => category.slug === current.type) ? current.type : fallbackCategory,
        }));
        setForm((current) => ({
          ...current,
          type: nextCategories.some((category) => category.slug === current.type) ? current.type : fallbackCategory,
        }));
      })
      .catch(() => setCategories([]));
  }, []);

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      price: product.price || '',
      image: product.image || '',
      baseImage: product.baseImage || '',
      backImage: product.backImage || '',
      galleryImages: (product.galleryImages || []).join('\n'),
      description: product.description || '',
      type: product.type || categories[0]?.slug || '',
      isOutOfStock: Boolean(product.isOutOfStock),
    });
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(createEmptyForm(categories[0]?.slug || ''));
    setFormError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch(apiUrl(`/admin/products/${editingId}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          galleryImages: parseGalleryImages(form.galleryImages),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to update');
      cancelEdit();
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(apiUrl(`/admin/products/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleStockToggle = async (product) => {
    try {
      const res = await fetch(apiUrl(`/admin/products/${product._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name || '',
          price: Number(product.price) || 0,
          image: product.image || '',
          baseImage: product.baseImage || '',
          backImage: product.backImage || '',
          description: product.description || '',
          type: product.type || categories[0]?.slug || '',
          galleryImages: product.galleryImages || [],
          isOutOfStock: !product.isOutOfStock,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update stock status');
      }

      if (editingId === product._id) {
        cancelEdit();
      }

      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to update stock status');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch(apiUrl('/admin/products'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          price: Number(addForm.price),
          galleryImages: parseGalleryImages(addForm.galleryImages),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to add product');
      setAddForm(createEmptyForm(categories[0]?.slug || ''));
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setAddError(err.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Admin dashboard</p>
          <h2>Manage Products</h2>
        </div>
        <div className="admin-header__actions">
          <button onClick={() => navigate('/admin/orders')} className="admin-btn admin-btn--ghost" type="button">
            Orders
          </button>
          <button onClick={() => navigate('/admin/categories')} className="admin-btn admin-btn--ghost" type="button">
            Categories
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setAddError('');
              setAddForm(createEmptyForm(categories[0]?.slug || ''));
            }}
            className="admin-btn admin-btn--primary"
            type="button"
          >
            {showAddForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>
      </section>

      {!loading && (
        <section className="admin-stats">
          <article className="admin-stat-card admin-stat-card--primary">
            <p>Total Products</p>
            <strong>{products.length}</strong>
          </article>
          {categories.slice(0, 3).map((category) => (
            <article key={category._id} className="admin-stat-card admin-stat-card--neutral">
              <p>{category.name}</p>
              <strong>{products.filter((product) => product.type === category.slug).length}</strong>
            </article>
          ))}
        </section>
      )}

      {showAddForm && (
        <section className="admin-form-card">
          <ProductForm
            values={addForm}
            onChange={(e) =>
              setAddForm({
                ...addForm,
                [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
              })
            }
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setShowAddForm(false);
              setAddForm(createEmptyForm(categories[0]?.slug || ''));
            }}
            error={addError}
            loading={addLoading}
            submitLabel="Add Product"
            categories={categories}
          />
        </section>
      )}

      {loading ? (
        <main className="admin-page admin-page--message">Loading products...</main>
      ) : (
        <section className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <Fragment key={product._id}>
                  <tr key={product._id}>
                    <td>
                      <img src={product.image} alt={product.name} className="admin-table__thumb" />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <p className="admin-table__sub">{product.description}</p>
                      {product.backImage && <p className="admin-table__sub">Back design enabled</p>}
                      {product.isOutOfStock && <p className="admin-table__stock admin-table__stock--out">Out of stock</p>}
                    </td>
                    <td>{formatCategoryLabel(product.type)}</td>
                    <td>Rs. {product.price}</td>
                    <td>
                      <div className="admin-header__actions">
                        <button
                          onClick={() => (editingId === product._id ? cancelEdit() : startEdit(product))}
                          className="admin-btn admin-btn--ghost"
                          type="button"
                        >
                          {editingId === product._id ? 'Cancel' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleStockToggle(product)}
                          className={`admin-btn ${product.isOutOfStock ? 'admin-btn--success' : 'admin-btn--warning'}`}
                          type="button"
                        >
                          {product.isOutOfStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="admin-btn admin-btn--danger"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === product._id && (
                    <tr>
                      <td colSpan={5} className="admin-table__edit-cell">
                        <ProductForm
                          values={form}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
                            })
                          }
                          onSubmit={handleEditSubmit}
                          onCancel={cancelEdit}
                          error={formError}
                          loading={formLoading}
                          submitLabel="Save Changes"
                          categories={categories}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default AdminProducts;
