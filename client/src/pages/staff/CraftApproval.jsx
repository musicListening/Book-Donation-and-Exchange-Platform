import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import { API_BASE } from '../../services/api';

const conditionColors = {
  NEW: '#E8F5E9', LIKE_NEW: '#E3F2FD', GOOD: '#FFF8E1', FAIR: '#FFF3E0', POOR: '#FFEBEE'
};
const conditionTextColors = {
  NEW: '#2E7D32', LIKE_NEW: '#1565C0', GOOD: '#F57F17', FAIR: '#E65100', POOR: '#C62828'
};

const isValidUrl = (url) => url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image'));

export default function StaffMarketplace() {
  const [currentTab, setCurrentTab] = useState('books'); // 'books' | 'crafts' | 'pending'
  const [books, setBooks] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [pendingCrafts, setPendingCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrorMap, setImageErrorMap] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { item, type: 'book' | 'craft' }
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    genre: '',
    condition: 'GOOD',
    description: '',
    pointsPrice: 0,
    imageFile: null,
  });

  useEffect(() => {
    fetchMarketplace();
  }, [currentTab]);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [booksRes, craftsRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/books/marketplace`, { headers }),
        fetch(`${API_BASE}/crafts?status=LISTED`, { headers }),
        fetch(`${API_BASE}/crafts?status=DRAFT`, { headers }),
      ]);

      if (booksRes.ok) setBooks(await booksRes.json());
      if (craftsRes.ok) setCrafts(await craftsRes.json());
      if (pendingRes.ok) setPendingCrafts(await pendingRes.json());
    } catch (err) {
      console.error('Failed to load staff marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS: CRAFT APPROVE / REJECT ---
  const handleApproveCraft = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/crafts/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMarketplace();
    } catch (err) {
      alert('Failed to approve craft');
    }
  };

  const handleRejectCraft = async (id) => {
    if (!confirm('Reject this craft listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/crafts/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMarketplace();
    } catch (err) {
      alert('Failed to reject craft');
    }
  };

  // --- ACTIONS: DELETE ITEM ---
  const handleDeleteItem = async (item, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const idsToDelete = (typeof item === 'object' && item.bookIds && item.bookIds.length > 0)
        ? item.bookIds
        : [(typeof item === 'object' ? item.id : item)];

      for (const bId of idsToDelete) {
        const endpoint = type === 'book' ? `${API_BASE}/books/${bId}` : `${API_BASE}/crafts/${bId}`;
        await fetch(endpoint, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert(`${type === 'book' ? 'Book(s)' : 'Craft'} deleted successfully.`);
      fetchMarketplace();
    } catch (err) {
      alert(`Failed to delete ${type}: ${err.message}`);
    }
  };

  // --- ACTIONS: EDIT ITEM ---
  const openEditModal = (item, type) => {
    setEditingItem({ item, type });
    setEditForm({
      title: item.title || '',
      author: item.author || '',
      genre: item.genre || '',
      condition: item.condition || 'GOOD',
      description: item.description || '',
      pointsPrice: item.pointsPrice || 0,
      imageFile: null,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const token = localStorage.getItem('token');
      const { item, type } = editingItem;
      const idsToUpdate = item.bookIds && item.bookIds.length > 0 ? item.bookIds : [item.id];

      for (const bId of idsToUpdate) {
        const endpoint = type === 'book' ? `${API_BASE}/books/${bId}` : `${API_BASE}/crafts/${bId}`;

        const formData = new FormData();
        formData.append('title', editForm.title);
        if (editForm.author) formData.append('author', editForm.author);
        if (editForm.genre) formData.append('genre', editForm.genre);
        if (editForm.condition) formData.append('condition', editForm.condition);
        if (editForm.description) formData.append('description', editForm.description);
        formData.append('pointsPrice', editForm.pointsPrice);
        if (editForm.imageFile) {
          formData.append('image', editForm.imageFile);
        }

        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error('Save failed');
      }

      setShowEditModal(false);
      setEditingItem(null);
      alert('Item updated successfully!');
      fetchMarketplace();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save changes.');
    }
  };

  // Filtering Logic
  const getItemsForCurrentTab = () => {
    if (currentTab === 'books') return books;
    if (currentTab === 'crafts') return crafts;
    return pendingCrafts;
  };

  const filterProducts = (items) => {
    return items.filter(item => {
      const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.genre === categoryFilter || item.category === categoryFilter;
      let matchesPrice = true;
      const price = item.pointsPrice || item.price || 0;
      if (priceFilter === 'low') matchesPrice = price < 200;
      else if (priceFilter === 'mid') matchesPrice = price >= 200 && price <= 400;
      else if (priceFilter === 'high') matchesPrice = price > 400;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  };

  const currentItems = getItemsForCurrentTab();
  const filteredItems = filterProducts(currentItems);

  // Styles matching user marketplace
  const styles = {
    pageHeader: { marginBottom: 32, textAlign: 'center' },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 36, marginBottom: 8, color: '#1E4D4B' },
    tabs: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
    tabBtn: { padding: '12px 28px', borderRadius: 50, border: '2px solid #1E4D4B', background: 'transparent', color: '#1E4D4B', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-family)' },
    tabBtnActive: { background: '#1E4D4B', color: 'white' },
    filterBar: { background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
    searchBox: { flex: 1, position: 'relative', minWidth: 280 },
    searchInput: { width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #DEE2E6', borderRadius: 12, fontFamily: 'var(--font-family)', fontSize: 14, boxSizing: 'border-box' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: 12 },
    filterSelect: { padding: '12px 16px', border: '1px solid #DEE2E6', borderRadius: 12, background: 'white', fontFamily: 'var(--font-family)', fontSize: 14 },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
    productCard: { background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #DEE2E6', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
    imageContainer: { height: 200, position: 'relative', overflow: 'hidden' },
    bookImage: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 700, color: '#1E4D4B' },
    productBadge: { position: 'absolute', top: 12, left: 12, background: '#E76F51', color: 'white', padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', zIndex: 2 },
    productDetails: { padding: 20, display: 'flex', flexDirection: 'column', flex: 1 },
    productMeta: { color: '#6C757D', fontSize: 12, marginBottom: 6, fontFamily: 'var(--font-family)' },
    productTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, height: 48, overflow: 'hidden', fontFamily: 'var(--font-family)', color: '#212529' },
    productPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 },
    productPrice: { fontSize: 20, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'center', gap: 4 },
    btnEdit: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13, flex: 1 },
    btnDelete: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#C62828', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13, flex: 1 },
    btnApprove: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13, flex: 1 },
  };

  return (
    <StaffLayout title="Marketplace">
      <div style={{ padding: 32 }}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>Marketplace Management</h1>
          <p style={{ color: '#6C757D', fontFamily: 'var(--font-family)' }}>
            Manage published marketplace items (books and crafts), update pricing or photos, or remove listings.
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tabBtn, ...(currentTab === 'books' ? styles.tabBtnActive : {}) }}
            onClick={() => setCurrentTab('books')}
          >
            📚 Books
          </button>
          <button
            style={{ ...styles.tabBtn, ...(currentTab === 'crafts' ? styles.tabBtnActive : {}) }}
            onClick={() => setCurrentTab('crafts')}
          >
            🎨 Paper Crafts
          </button>
          <button
            style={{ ...styles.tabBtn, ...(currentTab === 'pending' ? styles.tabBtnActive : {}) }}
            onClick={() => setCurrentTab('pending')}
          >
            ⏳ Pending Crafts ({pendingCrafts.length})
          </button>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C757D' }}>🔍</span>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search marketplace items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {currentTab === 'books' && (
                <>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Academic">Academic</option>
                  <option value="Children">Children's Books</option>
                  <option value="Comics">Comics & Manga</option>
                  <option value="Mixed">Mixed Collection</option>
                </>
              )}
              {currentTab !== 'books' && (
                <>
                  <option value="Paper Crafts">Paper Crafts</option>
                  <option value="Woodwork">Woodwork</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Upcycled">Upcycled</option>
                  <option value="Mixed Media">Mixed Media</option>
                </>
              )}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect} value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="all">Any Points</option>
              <option value="low">Under 200 pts</option>
              <option value="mid">200 - 400 pts</option>
              <option value="high">400+ pts</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6C757D' }}>Loading marketplace items...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6C757D' }}>
            <p style={{ fontSize: 48 }}>{currentTab === 'books' ? '📚' : '🎨'}</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No items found</p>
            <p>No items match your current tab or search filters.</p>
          </div>
        ) : (
          <div style={styles.productGrid}>
            {filteredItems.map((item) => {
              const isBook = currentTab === 'books';
              const rawImg = item.imageUrl || (item.donorImages && item.donorImages.length > 0 ? item.donorImages[0] : null);
              const hasValidImg = isValidUrl(rawImg) && !imageErrorMap[item.id];

              return (
                <div key={item.id} style={styles.productCard}>
                  {/* Image Header */}
                  <div style={{ ...styles.imageContainer, background: isBook ? 'linear-gradient(135deg, #E8F0EF, #D5E8D4)' : 'linear-gradient(135deg, #FFF5EC, #FFE8D6)' }}>
                    {hasValidImg ? (
                      <img
                        src={rawImg}
                        alt={item.title}
                        style={styles.bookImage}
                        onError={() => setImageErrorMap(prev => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        <span>{item.genre?.[0] || item.title?.[0] || (isBook ? '📚' : '🎨')}</span>
                      </div>
                    )}
                    <span style={styles.productBadge}>{isBook ? (item.collection?.category || item.genre || 'Book') : 'Craft'}</span>
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      background: '#1E4D4B', color: 'white',
                      padding: '4px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700, zIndex: 2
                    }}>
                      Qty: {item.quantity || 1}
                    </span>
                  </div>

                  {/* Details Body */}
                  <div style={styles.productDetails}>
                    <p style={styles.productMeta}>
                      {isBook ? (item.author ? `by ${item.author}` : 'Donated Book') : `by ${item.user?.name || 'Seller'}`}
                    </p>
                    <h3 style={styles.productTitle}>{item.title}</h3>

                    {/* Condition Tag (for Books) */}
                    {item.condition && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: conditionColors[item.condition] || '#F1F3F5',
                          color: conditionTextColors[item.condition] || '#495057',
                          fontWeight: 600,
                          width: 'fit-content',
                          marginBottom: 8,
                        }}
                      >
                        {item.condition}
                      </span>
                    )}

                    {/* Price Row */}
                    <div style={styles.productPriceRow}>
                      <span style={styles.productPrice}>
                        🏷️ {isBook ? `Rs. ${item.pointsPrice || 0}` : `${item.pointsPrice || 0} pts`}
                      </span>
                    </div>

                    {/* Staff Action Buttons (Edit & Delete) */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F1F3F5' }}>
                      {currentTab === 'pending' ? (
                        <>
                          <button onClick={() => handleApproveCraft(item.id)} style={styles.btnApprove}>
                            ✅ Approve
                          </button>
                          <button onClick={() => handleRejectCraft(item.id)} style={styles.btnDelete}>
                            ❌ Reject
                          </button>
                          <button onClick={() => openEditModal(item, 'craft')} style={styles.btnEdit}>
                            ✏️ Edit
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openEditModal(item, isBook ? 'book' : 'craft')} style={styles.btnEdit}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDeleteItem(item, isBook ? 'book' : 'craft')} style={styles.btnDelete}>
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL FOR STAFF */}
      {showEditModal && editingItem && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#1E4D4B', fontFamily: 'Playfair Display, serif', fontSize: 24 }}>
              Edit {editingItem.type === 'book' ? 'Book Listing' : 'Craft Listing'}
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Item Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                  required
                />
              </div>

              {editingItem.type === 'book' ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Author</label>
                    <input
                      type="text"
                      value={editForm.author}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Genre / Category</label>
                    <select
                      value={editForm.genre}
                      onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                    >
                      <option value="">Select Category...</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Academic">Academic</option>
                      <option value="Children">Children's Books</option>
                      <option value="Comics">Comics & Manga</option>
                      <option value="Mixed">Mixed Collection</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Condition</label>
                    <select
                      value={editForm.condition}
                      onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                    >
                      <option value="NEW">NEW (New)</option>
                      <option value="LIKE_NEW">LIKE_NEW (Like New)</option>
                      <option value="GOOD">GOOD (Good)</option>
                      <option value="FAIR">FAIR (Fair)</option>
                      <option value="POOR">POOR (Poor)</option>
                    </select>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>
                  {editingItem.type === 'book' ? 'Selling Price (Rs.)' : 'Price (Points)'}
                </label>
                <input
                  type="number"
                  value={editForm.pointsPrice}
                  onChange={(e) => setEditForm({ ...editForm, pointsPrice: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #DEE2E6', fontSize: 14, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-family)' }}>Replace Cover Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, imageFile: e.target.files[0] })}
                  style={{ width: '100%', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #DEE2E6', background: '#F8F9FA', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#1E4D4B', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
