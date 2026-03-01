import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = {
  name: '',
  price: '',
  image: '',
  baseImage: '',
  description: '',
  type: 'tshirt',
};

const TYPE_LABELS = { tshirt: 'T-Shirt', hoodie: 'Hoodie', shirt: 'Shirt' };

const inputStyle = {
  width: '100%',
  padding: '7px',
  marginBottom: '10px',
  boxSizing: 'border-box',
};

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // add new product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:3000/products')
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  /* ── EDIT ── */
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

  /* ── DELETE ── */
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

  /* ── ADD NEW ── */
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

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text' },
    { name: 'price', label: 'Price (₹)', type: 'number' },
    { name: 'image', label: 'Thumbnail Image Path', type: 'text' },
    { name: 'baseImage', label: 'Base Canvas Image Path', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
  ];

  const ProductForm = ({ values, onChange, onSubmit, onCancel, error, loading, submitLabel }) => (
    <form onSubmit={onSubmit} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
      {fields.map(f => (
        <div key={f.name}>
          <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: 'bold' }}>{f.label}</label>
          <input
            type={f.type}
            name={f.name}
            value={values[f.name]}
            onChange={onChange}
            required
            style={inputStyle}
          />
        </div>
      ))}

      <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: 'bold' }}>Type</label>
      <select
        name="type"
        value={values.type}
        onChange={onChange}
        style={{ ...inputStyle }}
      >
        <option value="tshirt">T-Shirt</option>
        <option value="hoodie">Hoodie</option>
        <option value="shirt">Shirt</option>
      </select>

      {error && <p style={{ color: 'red', margin: '8px 0' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button type="submit" disabled={loading}
          style={{ padding: '8px 20px', background: '#2a2', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: '8px 20px', background: '#888', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Manage Products</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/orders')}
            style={{ padding: '8px 16px', cursor: 'pointer' }}>
            ← Orders
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddError(''); setAddForm(EMPTY_FORM); }}
            style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            {showAddForm ? 'Cancel' : '+ Add New Product'}
          </button>
        </div>
      </div>

      {/* Add new product form */}
      {showAddForm && (
        <ProductForm
          values={addForm}
          onChange={e => setAddForm({ ...addForm, [e.target.name]: e.target.value })}
          onSubmit={handleAddSubmit}
          onCancel={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }}
          error={addError}
          loading={addLoading}
          submitLabel="Add Product"
        />
      )}

      {loading ? <p>Loading products...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
              <th style={th}>Image</th>
              <th style={th}>Name</th>
              <th style={th}>Type</th>
              <th style={th}>Price</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <>
                <tr key={product._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={td}>
                    <img src={product.image} alt={product.name}
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  </td>
                  <td style={td}>
                    <strong>{product.name}</strong>
                    <p style={{ margin: '2px 0', fontSize: '12px', color: '#777' }}>{product.description}</p>
                  </td>
                  <td style={td}>{TYPE_LABELS[product.type] || product.type}</td>
                  <td style={td}>₹{product.price}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editingId === product._id ? cancelEdit() : startEdit(product)}
                        style={{ padding: '6px 14px', background: '#448', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        {editingId === product._id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{ padding: '6px 14px', background: '#e44', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Inline edit form row */}
                {editingId === product._id && (
                  <tr key={`edit-${product._id}`}>
                    <td colSpan={5} style={{ padding: '12px', background: '#fffbe6' }}>
                      <ProductForm
                        values={form}
                        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
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
      )}
    </div>
  );
}

const th = { padding: '12px', borderBottom: '2px solid #ddd', fontWeight: 'bold' };
const td = { padding: '12px', verticalAlign: 'middle' };

export default AdminProducts;