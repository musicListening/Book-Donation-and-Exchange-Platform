// pages/staff/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { bookAPI } from '../../services/api';

function InventoryManagement() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    book: '',
    genre: '',
    condition: 'GOOD',
    quantity: '',
    location: ''
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'INVENTORY STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({ name: 'Test Staff', role: 'INVENTORY STAFF', id: 'test-user-123' });
      }
    } else {
      setCurrentUser({ name: 'Test Staff', role: 'INVENTORY STAFF', id: 'test-user-123' });
    }
  }, []);

  // ===== LOAD INVENTORY FROM DATABASE =====
  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await bookAPI.getAll();
      setInventory(data);
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      alert('Failed to load inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'IM';
  };

  // ===== CREATE Book =====
  const handleCreate = async () => {
    try {
      const newBook = await bookAPI.create({
        title: formData.book,
        genre: formData.genre,
        condition: formData.condition,
        quantity: parseInt(formData.quantity),
        location: formData.location,
        userId: currentUser.id
      });
      setInventory([newBook, ...inventory]);
      setShowModal(false);
      resetForm();
      alert('Book added successfully!');
    } catch (error) {
      console.error('❌ Error creating book:', error);
      alert('Failed to create book: ' + error.message);
    }
  };

  // ===== EDIT Book (open modal) =====
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      book: item.title,
      genre: item.genre || '',
      condition: item.condition || 'GOOD',
      quantity: item.quantity?.toString() || '',
      location: item.location || ''
    });
    setShowModal(true);
  };

  // ===== UPDATE Book =====
  const handleUpdate = async () => {
    try {
      const updated = await bookAPI.update(editingItem.id, {
        title: formData.book,
        genre: formData.genre,
        condition: formData.condition,
        quantity: parseInt(formData.quantity),
        location: formData.location
      });
      setInventory(inventory.map(item => item.id === updated.id ? updated : item));
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      alert('Book updated successfully!');
    } catch (error) {
      console.error('❌ Error updating book:', error);
      alert('Failed to update book: ' + error.message);
    }
  };

  // ===== DELETE Book =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await bookAPI.delete(id);
      setInventory(inventory.filter(item => item.id !== id));
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting book:', error);
      alert('Failed to delete book: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      book: '',
      genre: '',
      condition: 'GOOD',
      quantity: '',
      location: ''
    });
  };

  // Calculate stats
  const totalBooks = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = inventory.filter(item => (item.quantity || 0) < 10);

  return (
    <StaffLayout>
      <div className="content-header">
        <h1>Inventory Management</h1>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <h3>Total Books</h3>
          <div className="stat-value">{totalBooks.toLocaleString()}</div>
          <div className="stat-trend">▲ +528 this week</div>
        </div>
        <div className="stat-card">
          <h3>Unique Titles</h3>
          <div className="stat-value">{inventory.length}</div>
          <div className="stat-trend">{loading ? 'Loading...' : 'Live from database'}</div>
        </div>
        <div className="stat-card">
          <h3>Low Stock Alert</h3>
          <div className="stat-value">{lowStockItems.length}</div>
          <div className="stat-trend negative">Critical items</div>
        </div>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
          <button className="new-donation-btn" onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}>
            + Add New Book
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No books in inventory. Click "Add New Book" to get started!
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Genre</th>
                  <th>Condition</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.genre || '—'}</td>
                    <td>
                      <span className={`status-badge ${
                        item.condition === 'NEW' || item.condition === 'LIKE_NEW' ? 'published' :
                        item.condition === 'GOOD' ? 'in-review' :
                        item.condition === 'FAIR' ? 'draft' : 'delayed'
                      }`}>
                        {item.condition || 'GOOD'}
                      </span>
                    </td>
                    <td>{item.quantity || 0}</td>
                    <td>{item.location || '—'}</td>
                    <td>
                      <div className="action-group">
                        <button className="btn-small" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn-small-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Showing {inventory.length} of {inventory.length} titles</span>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingItem ? 'Edit Book' : 'Add New Book'}</h2>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Book Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.book}
                onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                placeholder="Enter book title"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Genre</label>
              <input
                type="text"
                className="form-control"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g., Fiction, History, Science"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Condition</label>
                <select
                  className="form-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Colombo Warehouse, Kandy Store"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => { setShowModal(false); setEditingItem(null); resetForm(); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={editingItem ? handleUpdate : handleCreate}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1E4D4B', color: 'white' }}
              >
                {editingItem ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default InventoryManagement;