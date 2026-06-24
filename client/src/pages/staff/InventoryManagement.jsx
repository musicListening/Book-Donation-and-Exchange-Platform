// pages/staff/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function InventoryManagement() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [inventory] = useState([
    { id: 1, book: 'Madol Doowa by Martin Wickramasinghe', genre: 'Sinhala Literature', condition: 'Pristine', quantity: 25, location: 'Colombo Warehouse' },
    { id: 2, book: 'Gamperaliya by Martin Wickramasinghe', genre: 'Sinhala Novel', condition: 'Very Good', quantity: 18, location: 'Kandy Store' },
    { id: 3, book: 'The History of Ceylon', genre: 'Sri Lankan History', condition: 'Good', quantity: 12, location: 'Colombo Warehouse' },
    { id: 4, book: 'Buddhist Philosophy Guide', genre: 'Religion', condition: 'Pristine', quantity: 45, location: 'Kandy Store' },
    { id: 5, book: 'Sri Lankan Cookbook Collection', genre: 'Cuisine', condition: 'Very Good', quantity: 8, location: 'Galle Branch' },
    { id: 6, book: 'Ceylon Tea Heritage', genre: 'History', condition: 'Good', quantity: 15, location: 'Nuwara Eliya Store' },
    { id: 7, book: 'Sinharaja Rainforest Guide', genre: 'Nature', condition: 'Pristine', quantity: 22, location: 'Colombo Warehouse' },
    { id: 8, book: 'Ancient Cities of Anuradhapura', genre: 'Archaeology', condition: 'Very Good', quantity: 30, location: 'Kandy Store' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    book: '',
    genre: '',
    condition: 'Pristine',
    quantity: '',
    location: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'INVENTORY STAFF'
      });
    }
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

  // Placeholder CRUD functions
  const handleCreate = () => {
    console.log('Create inventory item:', formData);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      book: item.book,
      genre: item.genre,
      condition: item.condition,
      quantity: item.quantity.toString(),
      location: item.location
    });
    setShowModal(true);
  };

  const handleUpdate = () => {
    console.log('Update inventory item:', editingItem, formData);
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    console.log('Delete inventory item:', id);
  };

  const resetForm = () => {
    setFormData({
      book: '',
      genre: '',
      condition: 'Pristine',
      quantity: '',
      location: ''
    });
  };

  const totalBooks = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < 10);

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
                  <td><strong>{item.book}</strong></td>
                  <td>{item.genre}</td>
                  <td>
                    <span className={`status-badge ${item.condition === 'Pristine' ? 'published' : item.condition === 'Damaged' ? 'delayed' : 'in-review'}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.location}</td>
                  <td>
                    <button className="btn-small" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn-small" onClick={() => handleDelete(item.id)} style={{ marginLeft: '8px', background: '#dc3545', color: 'white' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {inventory.length} of {inventory.length} titles</span>
        </div>
      </div>

      {/* Modal - UI only */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingItem ? 'Edit Book' : 'Add New Book'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Book Title</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.book}
                onChange={(e) => setFormData({...formData, book: e.target.value})}
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
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="Pristine">Pristine</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Quantity</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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
                onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
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
