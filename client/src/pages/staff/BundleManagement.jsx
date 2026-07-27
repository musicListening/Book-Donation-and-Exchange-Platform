// pages/staff/BundleManagement.jsx
import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { collectionAPI, bookAPI, API_BASE } from '../../services/api';

function BundleManagement() {
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [bundleBooks, setBundleBooks] = useState({});
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedBundleForBooks, setSelectedBundleForBooks] = useState(null);
  
  // Bundle form data
  const [formData, setFormData] = useState({
    name: '',
    includes: '',
    items: '',
    value: '',
    status: 'DRAFT'
  });

  // Stats
  const [stats, setStats] = useState({
    totalBundles: 0,
    draftBundles: 0,
    publishedBundles: 0,
    totalBooks: 0,
    uniqueTitles: 0,
    lowStockItems: 0
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

  // ===== LOAD ALL DATA =====
  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load bundles
      const bundlesData = await collectionAPI.getAll();
      console.log('✅ Bundles loaded:', bundlesData);
      
      const mappedBundles = bundlesData.map(item => ({
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
        }),
        createdAt: item.createdAt,
        cashPrice: item.cashPrice || 0,
        stock: item.stock || 0
      }));
      setBundles(mappedBundles);
      
      // Fetch book counts for each collection
      const bookCounts = {};
      for (const col of bundlesData) {
        try {
          const booksRes = await fetch(`${API_BASE}/books/collection/${col.id}`);
          if (booksRes.ok) {
            const booksData = await booksRes.json();
            bookCounts[col.id] = {
              count: booksData.length,
              books: booksData,
            };
          }
        } catch (err) {
          bookCounts[col.id] = { count: 0, books: [] };
        }
      }
      setBundleBooks(bookCounts);
      
      // Load inventory (just for stats)
      const inventoryData = await bookAPI.getAll();
      console.log('✅ Inventory loaded for stats:', inventoryData);
      
      // Calculate all stats
      const totalBundles = mappedBundles.length;
      const draftBundles = mappedBundles.filter(b => b.status === 'DRAFT').length;
      const publishedBundles = mappedBundles.filter(b => b.status === 'PUBLISHED').length;
      const totalBooks = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const uniqueTitles = inventoryData.length;
      const lowStockItems = inventoryData.filter(item => (item.quantity || 0) < 10);
      
      setStats({
        totalBundles,
        draftBundles,
        publishedBundles,
        totalBooks,
        uniqueTitles,
        lowStockItems: lowStockItems.length
      });
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
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

  // ===== BUNDLE CRUD =====
  const getFilteredBundles = () => {
    let filtered = [...bundles];
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(bundle => bundle.status === statusFilter);
    }
    return filtered;
  };

  const openBundleBooks = (bundle) => {
    setSelectedBundleForBooks(bundle);
    setShowBooksModal(true);
  };

  const filteredBundles = getFilteredBundles();

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
      
      await loadAllData();
      setShowModal(false);
      resetForm();
      alert('Bundle created successfully!');
    } catch (error) {
      console.error('❌ Error creating bundle:', error);
      alert('Failed to create bundle: ' + error.message);
    }
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
      
      await loadAllData();
      setShowModal(false);
      setEditingBundle(null);
      resetForm();
      alert('Bundle updated successfully!');
    } catch (error) {
      console.error('❌ Error updating bundle:', error);
      alert('Failed to update bundle: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    try {
      await collectionAPI.delete(id);
      console.log('✅ Bundle deleted');
      await loadAllData();
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

  const handleAddBookToMarketplace = async (bookId) => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/books/${bookId}/add-to-marketplace`, {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          if (!response.ok) throw new Error('Failed to add to marketplace');
          alert('Book added to marketplace!');
          await loadAllData();
      } catch (error) {
          console.error('Error adding book to marketplace:', error);
          alert('Failed to add book to marketplace: ' + error.message);
      }
  };

  const handleAddAllBooksToMarketplace = async (bundleId) => {
      const books = bundleBooks[bundleId]?.books || [];
      const inventoryBooks = books.filter(b => !b.isAvailable);
      if (inventoryBooks.length === 0) {
          alert('All books are already on the marketplace!');
          return;
      }
      if (!window.confirm(`Add ${inventoryBooks.length} book(s) to marketplace?`)) return;
      
      try {
          const token = localStorage.getItem('token');
          for (const book of inventoryBooks) {
              await fetch(`${API_BASE}/books/${book.id}/add-to-marketplace`, {
                  method: 'PUT',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                  }
              });
          }
          alert(`${inventoryBooks.length} book(s) added to marketplace!`);
          await loadAllData();
      } catch (error) {
          console.error('Error adding books to marketplace:', error);
          alert('Failed to add some books: ' + error.message);
      }
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

      {/* ===== STATS CARDS ===== */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <h3>📦 TOTAL BUNDLES</h3>
          <div className="stat-value">{stats.totalBundles}</div>
          <div className="stat-trend">Active collections</div>
        </div>

        <div className="stat-card">
          <h3>⏳ DRAFT</h3>
          <div className="stat-value" style={{ color: '#ffc107' }}>{stats.draftBundles}</div>
          <div className="stat-trend">Awaiting approval</div>
        </div>

        <div className="stat-card">
          <h3>✅ PUBLISHED</h3>
          <div className="stat-value" style={{ color: '#28a745' }}>{stats.publishedBundles}</div>
          <div className="stat-trend">Available in marketplace</div>
        </div>

        <div className="stat-card">
          <h3>📚 TOTAL BOOKS</h3>
          <div className="stat-value">{stats.totalBooks.toLocaleString()}</div>
          <div className="stat-trend">In inventory</div>
        </div>

        <div className="stat-card">
          <h3>📖 UNIQUE TITLES</h3>
          <div className="stat-value">{stats.uniqueTitles}</div>
          <div className="stat-trend">Different books</div>
        </div>

        <div className="stat-card">
          <h3>⚠️ LOW STOCK</h3>
          <div className="stat-value" style={{ color: stats.lowStockItems > 0 ? '#dc3545' : '#28a745' }}>
            {stats.lowStockItems}
          </div>
          <div className="stat-trend">{stats.lowStockItems > 0 ? '⚠️ Needs attention' : '✅ All good'}</div>
        </div>
      </div>

      {/* ===== BUNDLES TABLE ===== */}
      <div className="bundle-table-section">
        <div className="table-header">
          <h3>Bundle Inventory</h3>
          <div className="table-controls">
            <select 
              className="filter-btn" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #e5e5e5', 
                borderRadius: '8px', 
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <option value="All Statuses">All Statuses ▼</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>

            <button className="new-donation-btn" onClick={() => { resetForm(); setEditingBundle(null); setShowModal(true); }}>
              + New Bundle
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading bundles...</div>
        ) : filteredBundles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No bundles found. Click "New Bundle" to create one!
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
                {filteredBundles.map((bundle) => (
                  <tr key={bundle.id}>
                    <td className="bundle-id">{bundle.bundleId}</td>
                    <td>
                      <div className="bundle-name">{bundle.name}</div>
                      <div className="bundle-includes">{bundle.includes}</div>
                    </td>
                    <td>{bundleBooks[bundle.id]?.count || bundle.items || 0}</td>
                    <td>Rs. {bundle.value.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                        {bundle.status}
                      </span>
                    </td>
                    <td>{bundle.date}</td>
                    <td>
                      <div className="action-group">
                        <button className="btn-small" onClick={() => openBundleBooks(bundle)} style={{ marginRight: 4 }}>
                          View Books ({bundleBooks[bundle.id]?.count || 0})
                        </button>
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
          <span>Showing {filteredBundles.length} of {bundles.length} bundles</span>
        </div>
      </div>

      {/* ===== MODAL ===== */}
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

      {/* Books in Bundle Modal */}
      {showBooksModal && selectedBundleForBooks && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 800 }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: 20 }}>Books in {selectedBundleForBooks.name}</h2>
            
            {(bundleBooks[selectedBundleForBooks.id]?.books || []).length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    No books assigned to this bundle yet.
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button
                            className="btn-small"
                            onClick={() => handleAddAllBooksToMarketplace(selectedBundleForBooks.id)}
                            style={{ background: '#2A9D8F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                        >
                            Add All to Marketplace ({(bundleBooks[selectedBundleForBooks.id]?.books || []).filter(b => !b.isAvailable).length})
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {(bundleBooks[selectedBundleForBooks.id]?.books || []).map((book) => (
                            <div key={book.id} style={{ background: '#f8fafc', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                                {book.imageUrl ? (
                                    <img src={book.imageUrl} alt={book.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: 120, background: 'linear-gradient(135deg, #E8F0EF, #D5E8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#1E4D4B' }}>
                                        {book.title?.[0] || 'B'}
                                    </div>
                                )}
                                <div style={{ padding: 12 }}>
                                    <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                                    <p style={{ fontSize: 12, color: '#6C757D', margin: '0 0 6px' }}>{book.condition}</p>
                                    {book.isAvailable ? (
                                        <span style={{
                                            fontSize: 11, padding: '2px 8px', borderRadius: 4,
                                            background: '#E8F5E9', color: '#2E7D32',
                                        }}>
                                            ✓ On Marketplace
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleAddBookToMarketplace(book.id)}
                                            style={{
                                                width: '100%', padding: '6px 10px', fontSize: 12, fontWeight: 600,
                                                background: '#1E4D4B', color: 'white', border: 'none',
                                                borderRadius: 6, cursor: 'pointer', marginTop: 4
                                            }}
                                        >
                                            Add to Marketplace
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowBooksModal(false); setSelectedBundleForBooks(null); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default BundleManagement;