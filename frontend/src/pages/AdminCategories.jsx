import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const EMPTY_FORM = {
  name: '',
  slug: '',
  image: '',
};

const normalizeCategoryValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/admin/categories', {
        credentials: 'include',
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        slug: normalizeCategoryValue(form.slug || form.name),
      };

      const res = await fetch(
        editingId ? `http://localhost:3000/admin/categories/${editingId}` : 'http://localhost:3000/admin/categories',
        {
          method: editingId ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to save category');
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      image: category.image || '',
    });
    setError('');
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/admin/categories/${category._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete category');
      }

      if (editingId === category._id) {
        resetForm();
      }

      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Admin dashboard</p>
          <h2>Manage Categories</h2>
        </div>
        <div className="admin-header__actions">
          <button onClick={() => navigate('/admin/products')} className="admin-btn admin-btn--ghost" type="button">
            Products
          </button>
          <button onClick={() => navigate('/admin/orders')} className="admin-btn admin-btn--ghost" type="button">
            Orders
          </button>
        </div>
      </section>

      <section className="admin-form-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form__field">
            <label>Category Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Sweatshirts"
              required
            />
          </div>

          <div className="admin-form__field">
            <label>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="e.g. sweatshirts"
              required
            />
          </div>

          <div className="admin-form__field">
            <label>Thumbnail Image Path</label>
            <input
              type="text"
              value={form.image}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              placeholder="/category thumb/sweatshirt.jpg"
              required
            />
          </div>

          {error && <p className="admin-message admin-message--error">{error}</p>}

          <div className="admin-header__actions">
            <button type="submit" disabled={saving} className="admin-btn admin-btn--primary">
              {saving ? 'Saving...' : editingId ? 'Save Category' : 'Add Category'}
            </button>
            <button type="button" onClick={resetForm} className="admin-btn admin-btn--ghost">
              Clear
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <main className="admin-page admin-page--message">Loading categories...</main>
      ) : (
        <section className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <img src={category.image} alt={category.name} className="admin-table__thumb" />
                  </td>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
                    <div className="admin-header__actions">
                      <button type="button" onClick={() => handleEdit(category)} className="admin-btn admin-btn--ghost">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(category)} className="admin-btn admin-btn--danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default AdminCategories;
