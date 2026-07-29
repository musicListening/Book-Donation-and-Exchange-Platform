import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../services/api';

const conditionColors = {
  NEW: '#E8F5E9', LIKE_NEW: '#E3F2FD', GOOD: '#FFF8E1', FAIR: '#FFF3E0', POOR: '#FFEBEE'
};
const conditionTextColors = {
  NEW: '#2E7D32', LIKE_NEW: '#1565C0', GOOD: '#F57F17', FAIR: '#E65100', POOR: '#C62828'
};

const Marketplace = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';

  const [currentTab, setCurrentTab] = useState('bundles');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState({ points: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [books, setBooks] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDonorImages, setExpandedDonorImages] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('ss_current_user') || '{}');
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setUser(storedUser);
    setCart(storedCart);
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    try {
      const [booksRes, craftsRes] = await Promise.all([
        fetch(`${API_BASE}/books/marketplace`),
        fetch(`${API_BASE}/crafts?status=LISTED`),
      ]);
      if (booksRes.ok) setBooks(await booksRes.json());
      if (craftsRes.ok) setCrafts(await craftsRes.json());
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDonorImages = (id) => {
    setExpandedDonorImages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addToCart = (item, type) => {
    const itemPrice = item.pointsPrice || item.price || 0;
    const newCart = [...cart, { ...item, type, price: itemPrice }];
    setCart(newCart);
    localStorage.setItem('ss_cart', JSON.stringify(newCart));
    setToast({ show: true, message: 'Added to cart!' });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
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

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 0, margin: 0, minHeight: '100vh' },
    mainContent: { padding: 40, maxWidth: 1440, marginLeft: 'auto', marginRight: 'auto' },
    pageHeader: { marginBottom: 32, textAlign: 'center' },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 36, marginBottom: 8 },
    tabs: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 },
    tabBtn: { padding: '12px 32px', borderRadius: 50, border: '2px solid #1E4D4B', background: 'transparent', color: '#1E4D4B', fontWeight: 700, cursor: 'pointer' },
    tabBtnActive: { background: '#1E4D4B', color: 'white' },
    filterBar: { background: 'white', padding: 20, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
    searchBox: { flex: 1, position: 'relative', minWidth: 300 },
    searchInput: { width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #DEE2E6', borderRadius: 12, fontFamily: 'Inter, sans-serif' },
    filterGroup: { display: 'flex', alignItems: 'center', gap: 12 },
    filterSelect: { padding: '12px 16px', border: '1px solid #DEE2E6', borderRadius: 12, background: 'white', fontFamily: 'Inter, sans-serif' },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
    productCard: { background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #DEE2E6', transition: 'transform 0.2s, box-shadow 0.2s' },
    imageContainer: { height: 200, position: 'relative', overflow: 'hidden' },
    bookImage: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 700, color: '#1E4D4B' },
    productBadge: { position: 'absolute', top: 12, left: 12, background: '#E76F51', color: 'white', padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' },
    productDetails: { padding: 20 },
    productMeta: { color: '#6C757D', fontSize: 12, marginBottom: 6 },
    productTitle: { fontSize: 18, fontWeight: 700, marginBottom: 12, height: 50, overflow: 'hidden' },
    productPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
    productPrice: { fontSize: 20, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'center', gap: 4 },
    btnAdd: { padding: '8px 16px', borderRadius: 12, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, cursor: 'pointer' },
    toast: { position: 'fixed', top: 20, right: 20, padding: '15px 25px', background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12, transform: 'translateX(120%)', transition: 'transform 0.4s', zIndex: 1100 }
  };

  const currentItems = currentTab === 'bundles' ? books : crafts;
  const filteredItems = filterProducts(currentItems);

  if (loading) {
    return (
      <div style={styles.body}>
        <Navbar variant="user" user={user} cartCount={cart.length} />
        <div style={{ padding: 80, textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#6C757D' }}>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cart.length} />

      <main className="marketplace-main" style={styles.mainContent}>
        <div style={styles.pageHeader}><h1 style={styles.pageHeaderH1}>Marketplace</h1><p>Purchase curated book bundles and handmade crafts.</p></div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tabBtn, ...(currentTab === 'bundles' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentTab('bundles')}>📚 Books</button>
          <button style={{ ...styles.tabBtn, ...(currentTab === 'crafts' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentTab('crafts')}>🎨 Crafts</button>
        </div>

        <div className="marketplace-filter-bar" style={styles.filterBar}>
          <div style={styles.searchBox}><i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C757D' }}></i><input type="text" style={styles.searchInput} placeholder="Search for books or crafts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {currentTab === 'bundles' && (
                <>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Academic">Academic</option>
                  <option value="Children">Children's Books</option>
                  <option value="Comics">Comics & Manga</option>
                  <option value="Mixed">Mixed Collection</option>
                </>
              )}
              {currentTab === 'crafts' && (
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
              <option value="all">Any Points</option><option value="low">Under 200 pts</option><option value="mid">200 - 400 pts</option><option value="high">400+ pts</option>
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6C757D' }}>
            <p style={{ fontSize: 48 }}>{currentTab === 'bundles' ? '📚' : '🎨'}</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No {currentTab === 'bundles' ? 'books' : 'crafts'} found</p>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div style={styles.productGrid}>
            {filteredItems.map(item => (
              <div key={item.id} style={styles.productCard}>
                <div style={{ ...styles.imageContainer, background: currentTab === 'bundles' ? 'linear-gradient(135deg, #E8F0EF, #D5E8D4)' : 'linear-gradient(135deg, #FFF5EC, #FFE8D6)' }}>
                  {(item.imageUrl || (item.donorImages && item.donorImages.length > 0 ? item.donorImages[0] : null)) ? (
                    <img src={item.imageUrl || item.donorImages[0]} alt={item.title} style={styles.bookImage} />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <span>{item.genre?.[0] || item.title?.[0] || (currentTab === 'bundles' ? 'B' : 'C')}</span>
                    </div>
                  )}
                  <span style={styles.productBadge}>{currentTab === 'bundles' ? (item.category || item.collection?.category || item.genre || 'Book') : 'Handmade'}</span>
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#1E4D4B', color: 'white',
                    padding: '4px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700, zIndex: 2
                  }}>
                    Qty: {item.quantity || 1}
                  </span>
                </div>
                <div style={styles.productDetails}>
                  <p style={styles.productMeta}>
                    {currentTab === 'bundles' ? (item.author ? `by ${item.author}` : 'Donated Book') : `by ${item.user?.name || 'Unknown'}`}
                  </p>
                  <h3 style={styles.productTitle}>{item.title}</h3>

                  {/* Condition Badge */}
                  {item.condition && (
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4,
                      background: conditionColors[item.condition] || '#F1F3F5',
                      color: conditionTextColors[item.condition] || '#495057',
                      fontWeight: 600,
                    }}>
                      {item.condition}
                    </span>
                  )}



                  <div style={{ ...styles.productPriceRow, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={styles.productPrice}>
                        {currentTab === 'crafts' ? `${item.pointsPrice || item.price || 0} pts` : `LKR ${item.pointsPrice || item.price || 0}`}
                      </span>
                      {currentTab !== 'crafts' && (
                        <span style={{ fontSize: 11, color: '#2A9D8F', fontWeight: 700, marginTop: 4 }}>
                          <i className="fa-solid fa-coins"></i> Up to 25% off with points
                        </span>
                      )}
                    </div>
                    <button style={styles.btnAdd} onClick={() => addToCart(item, currentTab)}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast.show && <div style={{ ...styles.toast, transform: 'translateX(0)' }}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i><div>{toast.message}</div></div>}
    </div>
  );
};

export default Marketplace;