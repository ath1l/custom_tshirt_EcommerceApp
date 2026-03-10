import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const EMPTY_FORM = {
  name: '',
  price: '',
  image: '',
  baseImage: '',
  description: '',
  type: 'tshirt',
};

const TYPE_LABELS = { tshirt: 'T-Shirt', hoodie: 'Hoodie', shirt: 'Shirt' };

function ProductForm({ values, onChange, onSubmit, onCancel, error, loading, submitLabel }) {
  const fields = [
    { name: 'name', label: 'Product Name', type: 'text' },
    { name: 'price', label: 'Price (Rs.)', type: 'number' },
    { name: 'image', label: 'Thumbnail Image Path', type: 'text' },
    { name: 'baseImage', label: 'Base Canvas Image Path', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
  ];

  return (
    <form onSubmit={onSubmit} className="admin-form admin-form--embedded">
      {fields.map((field) => (
        <div key={field.name} className="admin-form__field">
          <label>{field.label}</label>
          <input type={field.type} name={field.name} value={values[field.name]} onChange={onChange} required />
        </div>
      ))}

      <div className="admin-form__field">
        <label>Type</label>
        <select name="type" value={values.type} onChange={onChange}>
          <option value="tshirt">T-Shirt</option>
          <option value="hoodie">Hoodie</option>
          <option value="shirt">Shirt</option>
        </select>
      </div>

      {error && <p className="admin-message admin-message--error">{error}</p>}

      <div className="admin-header__actions">
        <button type="submit" disabled={loading} className="admin-btn admin-btn--primary">
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
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:3000/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      baseImage: product.baseImage,
      description: product.description,
      type: product.type || 'tshirt',
    });
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch(`http://localhost:3000/admin/products/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) throw new Error('Failed to update');
      cancelEdit();
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`http://localhost:3000/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('http://localhost:3000/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, price: Number(addForm.price) }),
      });
      if (!res.ok) throw new Error('Failed to add product');
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      setAddError(err.message);
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
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setAddError('');
              setAddForm(EMPTY_FORM);
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
          <article className="admin-stat-card admin-stat-card--neutral">
            <p>T-Shirts</p>
            <strong>{products.filter((product) => product.type === 'tshirt').length}</strong>
          </article>
          <article className="admin-stat-card admin-stat-card--neutral">
            <p>Hoodies</p>
            <strong>{products.filter((product) => product.type === 'hoodie').length}</strong>
          </article>
          <article className="admin-stat-card admin-stat-card--neutral">
            <p>Shirts</p>
            <strong>{products.filter((product) => product.type === 'shirt').length}</strong>
          </article>
        </section>
      )}

      {showAddForm && (
        <section className="admin-form-card">
          <ProductForm
            values={addForm}
            onChange={(e) => setAddForm({ ...addForm, [e.target.name]: e.target.value })}
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setShowAddForm(false);
              setAddForm(EMPTY_FORM);
            }}
            error={addError}
            loading={addLoading}
            submitLabel="Add Product"
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
                <>
                  <tr key={product._id}>
                    <td>
                      <img src={product.image} alt={product.name} className="admin-table__thumb" />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <p className="admin-table__sub">{product.description}</p>
                    </td>
                    <td>{TYPE_LABELS[product.type] || product.type}</td>
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
                    <tr key={`edit-${product._id}`}>
                      <td colSpan={5} className="admin-table__edit-cell">
                        <ProductForm
                          values={form}
                          onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                          onSubmit={handleEditSubmit}
                          onCancel={cancelEdit}
                          error={formError}
                          loading={formLoading}
                          submitLabel="Save Changes"
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default AdminProducts;
