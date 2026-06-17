import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const MyCrafts = () => {
  const [user, setUser] = useState({ name: 'User' });
  const [myCrafts, setMyCrafts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCraft, setNewCraft] = useState({ title: '', category: 'Bookmarks', price: 50, description: '' });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('ss_current_user')) || { name: 'User' };
    setUser(storedUser);
    const storedCart = JSON.parse(localStorage.getItem('ss_cart') || '[]');
    setCartCount(storedCart.length);
    let storedCrafts = JSON.parse(localStorage.getItem('ss_user_crafts') || '[]');
    if (storedCrafts.length === 0) {
      storedCrafts = [
        { id: 101, title: 'Hand-Painted Bookmarks', price: 75, status: 'Active', image: '🔖' },
        { id: 102, title: 'Recycled Paper Journal', price: 120, status: 'Sold', image: '📓' }
      ];
      localStorage.setItem('ss_user_crafts', JSON.stringify(storedCrafts));
    }
    setMyCrafts(storedCrafts);
  }, []);

  const handleAddCraft = (e) => {
    e.preventDefault();
    const craft = { id: Date.now(), ...newCraft, status: 'Active', image: '🎨' };
    const updated = [craft, ...myCrafts];
    setMyCrafts(updated);
    localStorage.setItem('ss_user_crafts', JSON.stringify(updated));
    setShowModal(false);
    setNewCraft({ title: '', category: 'Bookmarks', price: 50, description: '' });
  };

  const removeCraft = (id) => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      const updated = myCrafts.filter(c => c.id !== id);
      setMyCrafts(updated);
      localStorage.setItem('ss_user_crafts', JSON.stringify(updated));
    }
  };

  const styles = {
    body: { fontFamily: 'Inter, sans-serif', backgroundColor: '#F1F3F5', color: '#343A40', paddingTop: 72, margin: 0 },
    header: { position: 'fixed', top: 0, left: 0, width: '100%', height: 72, background: 'white', borderBottom: '1px solid #DEE2E6', zIndex: 1000, padding: '0 40px' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1440, margin: '0 auto' },
    logo: { fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, color: '#1E4D4B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 },
    navLinks: { display: 'flex', gap: 32, listStyle: 'none' },
    navLink: { textDecoration: 'none', color: '#343A40', fontWeight: 500 },
    navLinkActive: { color: '#1E4D4B' },
    mainContent: { maxWidth: 1000, margin: '40px auto', padding: '0 20px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
    pageHeaderH1: { fontFamily: 'Playfair Display, serif', fontSize: 32 },
    btn: { padding: '12px 24px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnPrimary: { background: '#1E4D4B', color: 'white' },
    craftsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 },
    craftCard: { background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #DEE2E6' },
    craftImg: { height: 180, background: '#F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 },
    craftDetails: { padding: 20 },
    craftStatus: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 50, display: 'inline-block', marginBottom: 12 },
    statusActive: { background: 'rgba(42,157,143,0.1)', color: '#2A9D8F' },
    statusSold: { background: 'rgba(108,117,125,0.1)', color: '#6C757D' },
    craftTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
    craftPrice: { fontWeight: 800, color: '#1E4D4B', fontSize: 20 },
    removeBtn: { marginTop: 20, padding: 8, fontSize: 13, width: '100%', background: '#FFE8E8', color: '#E63946', border: 'none', borderRadius: 8, cursor: 'pointer' },
    emptyState: { textAlign: 'center', padding: '80px 0', gridColumn: '1 / -1' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: 'white', padding: 40, borderRadius: 16, maxWidth: 500, width: '95%' },
    formGroup: { marginBottom: 20 },
    formLabel: { display: 'block', fontWeight: 600, marginBottom: 8 },
    formControl: { width: '100%', padding: 12, border: '1px solid #DEE2E6', borderRadius: 8, fontFamily: 'inherit' }
  };

  return (
    <div style={styles.body}>
      <Navbar variant="user" user={user} cartCount={cartCount} />

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}><div><h1 style={styles.pageHeaderH1}>My Paper Crafts</h1><p style={{ color: '#6C757D' }}>Manage your listings and track your sales.</p></div><button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowModal(true)}><i className="fa-solid fa-plus"></i> Add New Craft</button></div>
        <div style={styles.craftsGrid}>
          {myCrafts.length === 0 ? (<div style={styles.emptyState}><i className="fa-solid fa-palette" style={{ fontSize: 64, color: '#DEE2E6', marginBottom: 20 }}></i><h3>You haven't listed any crafts yet.</h3><p>Turn your paper skills into points!</p></div>) : (myCrafts.map(craft => (<div key={craft.id} style={styles.craftCard}><div style={styles.craftImg}>{craft.image || '🎨'}</div><div style={styles.craftDetails}><span style={{ ...styles.craftStatus, ...(craft.status === 'Active' ? styles.statusActive : styles.statusSold) }}>{craft.status}</span><h3 style={styles.craftTitle}>{craft.title}</h3><div style={styles.craftPrice}><i className="fa-solid fa-coins"></i> {craft.price}</div>{craft.status === 'Active' && <button style={styles.removeBtn} onClick={() => removeCraft(craft.id)}>Remove Listing</button>}</div></div>)))}
        </div>
      </main>

      {showModal && (<div style={styles.modalOverlay}><div style={styles.modal}><h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 24 }}>List a New Craft</h2><form onSubmit={handleAddCraft}><div style={styles.formGroup}><label style={styles.formLabel}>Craft Name</label><input type="text" style={styles.formControl} placeholder="e.g. Hand-painted Bookmarks" required value={newCraft.title} onChange={(e) => setNewCraft({ ...newCraft, title: e.target.value })} /></div><div style={styles.formGroup}><label style={styles.formLabel}>Category</label><select style={styles.formControl} value={newCraft.category} onChange={(e) => setNewCraft({ ...newCraft, category: e.target.value })}><option>Bookmarks</option><option>Wall Art</option><option>Stationery</option><option>Origami</option></select></div><div style={styles.formGroup}><label style={styles.formLabel}>Points Price</label><input type="number" style={styles.formControl} placeholder="50" required min="10" value={newCraft.price} onChange={(e) => setNewCraft({ ...newCraft, price: parseInt(e.target.value) })} /></div><div style={styles.formGroup}><label style={styles.formLabel}>Description</label><textarea style={styles.formControl} rows="3" placeholder="Describe your creation..." value={newCraft.description} onChange={(e) => setNewCraft({ ...newCraft, description: e.target.value })}></textarea></div><div style={{ display: 'flex', gap: 12, marginTop: 32 }}><button type="button" style={{ ...styles.btn, flex: 1, background: '#DEE2E6' }} onClick={() => setShowModal(false)}>Cancel</button><button type="submit" style={{ ...styles.btn, ...styles.btnPrimary, flex: 2 }}>List My Craft</button></div></form></div></div>)}
    </div>
  );
};

export default MyCrafts;