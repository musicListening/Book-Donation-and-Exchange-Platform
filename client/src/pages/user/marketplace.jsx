import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';

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

  const bundles = JSON.parse(localStorage.getItem('ss_bundles') || '[]');
  const crafts = JSON.parse(localStorage.getItem('ss_crafts') || '[]');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { points: 0 };
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setUser(storedUser);
    setCart(storedCart);
  }, []);

  const updateCartCount = () => {
    document.getElementById('cartCount') && (document.getElementById('cartCount').innerText = cart.length);
  };

  const addToCart = (item, type) => {
    const newCart = [...cart, { ...item, type }];
    setCart(newCart);
    localStorage.setItem('ss_cart', JSON.stringify(newCart));
    setToast({ show: true, message: 'Added to cart!' });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
    updateCartCount();
  };

  const filterProducts = (items) => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || (currentTab === 'bundles' ? item.genre === categoryFilter : true);
      let matchesPrice = true;
      if (priceFilter === 'low') matchesPrice = item.price < 200;
      else if (priceFilter === 'mid') matchesPrice = item.price >= 200 && item.price <= 400;
      else if (priceFilter === 'high') matchesPrice = item.price > 400;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 0, margin: 0 },
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
    productCard: { background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #DEE2E6' },
    productImage: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, position: 'relative' },
    productBadge: { position: 'absolute', top: 12, left: 12, background: '#E76F51', color: 'white', padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' },
    productDetails: { padding: 20 },
    productMeta: { color: '#6C757D', fontSize: 12, marginBottom: 6 },
    productTitle: { fontSize: 18, fontWeight: 700, marginBottom: 12, height: 50, overflow: 'hidden' },
    productPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
    productPrice: { fontSize: 20, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'center', gap: 4 },
    btnAdd: { padding: '8px 16px', borderRadius: 12, border: 'none', background: '#1E4D4B', color: 'white', fontWeight: 600, cursor: 'pointer' },
    toast: { position: 'fixed', top: 20, right: 20, padding: '15px 25px', background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12, transform: 'translateX(120%)', transition: 'transform 0.4s', zIndex: 1100 }
  };

  const currentItems = currentTab === 'bundles' ? bundles : crafts;
  const filteredItems = filterProducts(currentItems);

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cart.length} />

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}><h1 style={styles.pageHeaderH1}>Marketplace</h1><p>Redeem your hard-earned points for curated treasures.</p></div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tabBtn, ...(currentTab === 'bundles' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentTab('bundles')}>📚 Book Bundles</button>
          <button style={{ ...styles.tabBtn, ...(currentTab === 'crafts' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentTab('crafts')}>🎨 Paper Crafts</button>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.searchBox}><i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C757D' }}></i><input type="text" style={styles.searchInput} placeholder="Search for bundles or crafts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div style={styles.filterGroup}>
            <select style={styles.filterSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {currentTab === 'bundles' && (
                <>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Academic">Academic</option>
                  <option value="Childrens">Children's</option>
                  <option value="Comics">Comics</option>
                  <option value="Rare Finds">Rare Finds</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Educational">Educational</option>
                  <option value="Classics">Classics</option>
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

        <div style={styles.productGrid}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.productCard}>
              <div style={{ ...styles.productImage, background: currentTab === 'bundles' ? 'linear-gradient(135deg, #E8F0EF, #D5E8D4)' : 'linear-gradient(135deg, #FFF5EC, #FFE8D6)' }}>
                {item.image}
                <span style={styles.productBadge}>{currentTab === 'bundles' ? item.genre : 'Handmade'}</span>
              </div>
              <div style={styles.productDetails}>
                <p style={styles.productMeta}>{currentTab === 'bundles' ? `Curated by ${item.curator}` : `By ${item.seller}`}</p>
                <h3 style={styles.productTitle}>{item.title}</h3>
                <div style={styles.productPriceRow}>
                  <span style={styles.productPrice}><i className="fa-solid fa-coins"></i> {item.price}</span>
                  <button style={styles.btnAdd} onClick={() => addToCart(item, currentTab)}><i className="fa-solid fa-cart-plus"></i> Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {toast.show && <div style={{ ...styles.toast, transform: 'translateX(0)' }}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i><div>{toast.message}</div></div>}
    </div>
  );
};

export default Marketplace;