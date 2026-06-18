// pages/staff/BundleManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';

function BundleManagement() {
  const [bundles] = useState([
    { 
      id: '#BND-9012', 
      name: 'Colombo Literary Collection', 
      includes: 'Includes: Martin Wickramasinghe, Ediriweera Sarachchandra, Gunadasa Amarasekara', 
      items: 12, 
      value: 45000.00, 
      status: 'PUBLISHED', 
      date: 'Oct 24, 2023' 
    },
    { 
      id: '#BND-9014', 
      name: 'Ancient Ceylon History Series', 
      includes: 'Includes: Anuradhapura Kingdom, Polonnaruwa Era, Kandyan Period', 
      items: 8, 
      value: 32500.50, 
      status: 'DRAFT', 
      date: 'Nov 02, 2023' 
    },
    { 
      id: '#BND-8892', 
      name: 'Sri Lankan Wildlife Collection', 
      includes: 'Includes: Yala National Park, Sinharaja Rainforest, Elephant Conservation', 
      items: 15, 
      value: 52800.00, 
      status: 'SOLD', 
      date: 'Oct 15, 2023' 
    },
    { 
      id: '#BND-9101', 
      name: 'Buddhist Philosophy Series', 
      includes: 'Includes: Dhamma Teachings, Jataka Stories, Meditation Guide', 
      items: 25, 
      value: 87500.00, 
      status: 'PUBLISHED', 
      date: 'Nov 10, 2023' 
    },
    { 
      id: '#BND-9123', 
      name: 'Tea Estate Stories of Nuwara Eliya', 
      includes: 'Includes: Plantation Life, British Era Tales, Hill Country Memoirs', 
      items: 10, 
      value: 42300.00, 
      status: 'PUBLISHED', 
      date: 'Dec 01, 2023' 
    },
    { 
      id: '#BND-9145', 
      name: 'Galle Fort Heritage Collection', 
      includes: 'Includes: Dutch Colonial Era, Maritime History, Fort Architecture', 
      items: 7, 
      value: 28900.00, 
      status: 'DRAFT', 
      date: 'Dec 12, 2023' 
    },
  ]);

  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    includes: '',
    items: '',
    value: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name || user.email || 'Staff User',
        role: user.role || 'OPERATIONS_STAFF'
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
    return 'SU';
  };

  // Placeholder CRUD functions
  const handleCreate = () => {
    console.log('Create bundle:', formData);
    setShowModal(false);
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      includes: bundle.includes,
      items: bundle.items.toString(),
      value: bundle.value.toString(),
      status: bundle.status
    });
    setShowModal(true);
  };

  const handleUpdate = () => {
    console.log('Update bundle:', editingBundle, formData);
    setShowModal(false);
    setEditingBundle(null);
  };

  const handleDelete = (id) => {
    console.log('Delete bundle:', id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      includes: '',
      items: '',
      value: '',
      status: 'DRAFT'
    });
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Bundle Management</h1>
          <p className="page-subtitle">Curate, monitor, and publish book collections for the marketplace.</p>
        </div>
        <div className="user-info">
          <span className="user-role">{currentUser.name}</span>
          <span className="user-title">{currentUser.role}</span>
          <div className="user-avatar">{getUserInitials()}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Active Bundles</h3>
          <div className="stat-value">{bundles.length}</div>
          <div className="stat-trend">▲ 6.8% from last month</div>
        </div>
        <div className="stat-card">
          <h3>Pending Publication</h3>
          <div className="stat-value">{bundles.filter(b => b.status === 'DRAFT').length}</div>
          <div className="stat-sub">Requires curator approval</div>
        </div>
        <div className="stat-card">
          <h3>Marketplace Revenue</h3>
          <div className="stat-value">Rs. 1,245,000</div>
          <div className="stat-sub">Current fiscal quarter</div>
        </div>
        
      </div>

      <div className="bundle-table-section">
        <div className="table-header">
          <h3>Bundle Inventory</h3>
          <div className="table-controls">
            <button className="filter-btn">All Statuses ▼</button>
            <button className="filter-btn">Sort by: Date Created ▼</button>
            <button className="new-donation-btn" onClick={() => { resetForm(); setEditingBundle(null); setShowModal(true); }}>
              + New Bundle
            </button>
          </div>
        </div>

        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>BUNDLE ID</th>
                <th>BUNDLE NAME</th>
                <th>ITEMS</th>
                <th>VALUE (Rs.)</th>
                <th>STATUS</th>
                <th>DATE CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((bundle) => (
                <tr key={bundle.id}>
                  <td className="bundle-id">{bundle.id}</td>
                  <td>
                    <div className="bundle-name">{bundle.name}</div>
                    <div className="bundle-includes">{bundle.includes}</div>
                  </td>
                  <td>{bundle.items}</td>
                  <td>Rs. {bundle.value.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                      {bundle.status}
                    </span>
                  </td>
                  <td>{bundle.date}</td>
                  <td>
                    <div className="action-group">
                      <button className="btn-small" onClick={() => handleEdit(bundle)}>Edit</button>
                      <button className="btn-small-danger" onClick={() => handleDelete(bundle.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {bundles.length} of {bundles.length} bundles</span>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1E4D4B', marginBottom: '20px' }}>{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</h2>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Bundle Name</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter bundle name"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Includes Description</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.includes}
                onChange={(e) => setFormData({...formData, includes: e.target.value})}
                placeholder="e.g., Includes: Author 1, Author 2"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Number of Items</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={formData.items}
                  onChange={(e) => setFormData({...formData, items: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Value (Rs.)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Status</label>
              <select 
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowModal(false); setEditingBundle(null); resetForm(); }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={editingBundle ? handleUpdate : handleCreate}
              >
                {editingBundle ? 'Update Bundle' : 'Create Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default BundleManagement;
