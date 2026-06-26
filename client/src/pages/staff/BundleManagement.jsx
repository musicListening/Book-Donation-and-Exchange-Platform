// pages/staff/BundleManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { collectionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function BundleManagement() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    includes: '',
    items: '',
    value: '',
    status: 'DRAFT'
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS_STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Test Staff',
          role: 'OPERATIONS_STAFF',
          id: 'test-user-123'
        });
      }
    } else {
      setCurrentUser({
        name: 'Test Staff',
        role: 'OPERATIONS_STAFF',
        id: 'test-user-123'
      });
    }
  }, []);

  // ===== LOAD BUNDLES FROM DATABASE =====
  const loadBundles = async () => {
    setLoading(true);
    try {
      const data = await collectionAPI.getAll();
      console.log('✅ Bundles loaded:', data);
      // Map database fields to UI fields
      const mappedBundles = data.map(item => ({
        id: item.id,
        bundleId: item.slug || `#BND-${String(item.id).slice(0, 4).toUpperCase()}`,
        name: item.title,
        includes: item.description || 'No description',
        items: item.stock || 0,
        value: item.cashPrice || item.pointsRequired || 0,
        status: item.isRare ? 'PUBLISHED' : 'DRAFT',
        date: new Date(item.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        })
      }));
      setBundles(mappedBundles);
    } catch (error) {
      console.error('❌ Error loading bundles:', error);
      alert('Failed to load bundles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load bundles on component mount
  useEffect(() => {
    loadBundles();
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

  // ===== CREATE Bundle =====
  const handleCreate = async () => {
    try {
      const newBundle = await collectionAPI.create({
        title: formData.name,
        description: formData.includes,
        category: 'General',
        stock: parseInt(formData.items),
        pointsRequired: Math.round(parseFloat(formData.value) / 100),
        cashPrice: parseFloat(formData.value),
        isRare: formData.status === 'PUBLISHED',
        userId: currentUser.id
      });
      console.log('✅ Bundle created:', newBundle);
      
      // Add to local state
      const mappedBundle = {
        id: newBundle.id,
        bundleId: newBundle.slug || `#BND-${String(newBundle.id).slice(0, 4).toUpperCase()}`,
        name: newBundle.title,
        includes: newBundle.description || 'No description',
        items: newBundle.stock || 0,
        value: newBundle.cashPrice || newBundle.pointsRequired || 0,
        status: newBundle.isRare ? 'PUBLISHED' : 'DRAFT',
        date: new Date(newBundle.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        })
      };
      
      setBundles([mappedBundle, ...bundles]);
      setShowModal(false);
      resetForm();
      alert('Bundle created successfully!');
    } catch (error) {
      console.error('❌ Error creating bundle:', error);
      alert('Failed to create bundle: ' + error.message);
    }
  };

  // ===== EDIT Bundle (open modal) =====
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

  // ===== UPDATE Bundle =====
  const handleUpdate = async () => {
    try {
      const updated = await collectionAPI.update(editingBundle.id, {
        title: formData.name,
        description: formData.includes,
        stock: parseInt(formData.items),
        pointsRequired: Math.round(parseFloat(formData.value) / 100),
        cashPrice: parseFloat(formData.value),
        isRare: formData.status === 'PUBLISHED'
      });
      console.log('✅ Bundle updated:', updated);
      
      // Update local state
      const mappedBundle = {
        id: updated.id,
        bundleId: updated.slug || editingBundle.bundleId,
        name: updated.title,
        includes: updated.description || 'No description',
        items: updated.stock || 0,
        value: updated.cashPrice || updated.pointsRequired || 0,
        status: updated.isRare ? 'PUBLISHED' : 'DRAFT',
        date: new Date(updated.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        })
      };
      
      setBundles(bundles.map(b => b.id === editingBundle.id ? mappedBundle : b));
      setShowModal(false);
      setEditingBundle(null);
      resetForm();
      alert('Bundle updated successfully!');
    } catch (error) {
      console.error('❌ Error updating bundle:', error);
      alert('Failed to update bundle: ' + error.message);
    }
  };

  // ===== DELETE Bundle =====
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    
    try {
      await collectionAPI.delete(id);
      console.log('✅ Bundle deleted');
      setBundles(bundles.filter(b => b.id !== id));
      alert('Bundle deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting bundle:', error);
      alert('Failed to delete bundle: ' + error.message);
    }
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

  // Calculate stats
  const totalBundles = bundles.length;
  const draftBundles = bundles.filter(b => b.status === 'DRAFT').length;

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
          <div className="stat-value">{totalBundles}</div>
          <div className="stat-trend">{loading ? 'Loading...' : 'Live from database'}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Publication</h3>
          <div className="stat-value">{draftBundles}</div>
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

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading bundles...</div>
        ) : bundles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No bundles yet. Click "New Bundle" to create one!
          </div>
        ) : (
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
                    <td className="bundle-id">{bundle.bundleId}</td>
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
        )}

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
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
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
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
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
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
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
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>Status</label>
              <select 
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
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
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={editingBundle ? handleUpdate : handleCreate}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#1E4D4B', color: 'white' }}
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