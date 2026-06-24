import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const Home = () => {
  // ===== STATE DECLARATIONS =====
  const [cartMessage, setCartMessage] = useState(null);
  const [counters, setCounters] = useState({
    books: 0,
    members: 0,
    points: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  // ===== FIRST useEffect - For initialization =====
  useEffect(() => {
    // Initialize Demo Data
    if (!localStorage.getItem('ss_users')) {
      const initialUsers = [
        { name: 'Arjun Sharma', email: 'user@example.com', password: 'user123', role: 'user', points: 450 },
        { name: 'Staff Member', email: 'staff@projenius.com', password: 'staff123', role: 'staff', points: 0 },
        { name: 'Admin User', email: 'admin@projenius.com', password: 'admin123', role: 'admin', points: 0 }
      ];
      const initialBundles = [
        { id: 1, title: 'Timeless Literature', curator: 'Staff Pick', genre: 'Fiction', price: 250, stock: 12, image: '📚' },
        { id: 2, title: 'Science for Kids', curator: 'Educator Choice', genre: 'Academic', price: 180, stock: 8, image: '🧪' },
        { id: 3, title: 'The Mystery Files', curator: 'Detective Club', genre: 'Mystery', price: 320, stock: 5, image: '🕵️' }
      ];
      const initialCrafts = [
        { id: 1, title: 'Origami Crane Set', curator: 'Akira', genre: 'Crafts', price: 75, stock: 15, image: '🦢' },
        { id: 2, title: 'Recycled Notebook', curator: 'Eco-Art', genre: 'Crafts', price: 120, stock: 10, image: '📔' }
      ];
      
      localStorage.setItem('ss_users', JSON.stringify(initialUsers));
      localStorage.setItem('ss_bundles', JSON.stringify(initialBundles));
      localStorage.setItem('ss_crafts', JSON.stringify(initialCrafts));
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }, []);

  // ===== SECOND useEffect - For Intersection Observer =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // ===== THIRD useEffect - For counter animation =====
  useEffect(() => {
    if (isVisible) {
      const targetBooks = 12450;
      const targetMembers = 3800;
      const targetPoints = 1200000;
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOut(progress);

        setCounters({
          books: Math.round(targetBooks * easedProgress),
          members: Math.round(targetMembers * easedProgress),
          points: Math.round(targetPoints * easedProgress)
        });

        if (currentStep >= steps) {
          setCounters({
            books: targetBooks,
            members: targetMembers,
            points: targetPoints
          });
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  // ===== handleAddToCart function =====
  const handleAddToCart = (item) => {
    const currentUser = localStorage.getItem('ss_current_user');
    
    if (!currentUser) {
      window.location.href = '/login?redirect=/cart';
      return;
    }

    try {
      const existingCart = JSON.parse(localStorage.getItem('ss_cart')) || [];
      
      const existingItemIndex = existingCart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1;
      } else {
        existingCart.push({ ...item, quantity: 1 });
      }

      localStorage.setItem('ss_cart', JSON.stringify(existingCart));
      
      setCartMessage(`${item.title} added to cart! 🛒`);
      setTimeout(() => setCartMessage(null), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage('Failed to add item to cart. Please try again.');
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const styles = {
    // Header - FIXED
    header: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      background: 'rgba(248,249,250,0.97)', 
      backdropFilter: 'blur(10px)', 
      borderBottom: '1px solid #DEE2E6', 
      zIndex: 1000, 
      padding: '0 40px'
    },
    navbar: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      height: 72, 
      maxWidth: 1440, 
      margin: '0 auto',
      position: 'relative',
      width: '100%'
    },
    logo: { 
      fontFamily: 'Playfair Display, serif', 
      fontSize: 28, 
      fontWeight: 800, 
      color: '#1E4D4B', 
      textDecoration: 'none', 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      flexShrink: 0,
      marginRight: '40px'
    },
    navLinks: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 32, 
      listStyle: 'none', 
      margin: 0, 
      padding: 0,
      flex: 1,
      justifyContent: 'center'
    },
    navLink: { 
      textDecoration: 'none', 
      color: '#343A40', 
      fontSize: 16, 
      fontWeight: 500, 
      position: 'relative',
      whiteSpace: 'nowrap'
    },
    navActions: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12,
      flexShrink: 0,
      marginLeft: 'auto'
    },
    pointsBadge: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 6, 
      background: '#E9C46A', 
      color: '#343A40', 
      padding: '6px 14px',
      borderRadius: 50, 
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    },
    mobileMenuBtn: { 
      display: 'none', 
      background: 'none', 
      border: 'none', 
      fontSize: 24, 
      color: '#343A40', 
      cursor: 'pointer',
      padding: '4px 8px'
    },
    
    btn: { display: 'inlineFlex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: 16, fontWeight: 600, borderRadius: 12, border: '2px solid transparent', cursor: 'pointer', textDecoration: 'none' },
    btnPrimary: { backgroundColor: '#1E4D4B', color: 'white', borderColor: '#1E4D4B' },
    btnSecondary: { backgroundColor: 'transparent', color: '#1E4D4B', borderColor: '#1E4D4B' },
    btnGold: { backgroundColor: '#E9C46A', color: '#343A40', borderColor: '#E9C46A' },
    btnSm: { padding: '8px 16px', fontSize: 14 },
    btnLg: { padding: '18px 36px', fontSize: 18 },
    
    hero: { padding: '120px 80px 80px', maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', minHeight: '85vh' },
    heroContent: { maxWidth: 560 },
    heroBadge: { display: 'inlineFlex', alignItems: 'center', gap: 6, background: 'rgba(231,111,81,0.1)', color: '#E76F51', padding: '8px 16px', borderRadius: 50, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
    heroTitle: { fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: '#343A40' },
    heroTitleSpan: { color: '#E76F51' },
    heroDescription: { fontSize: 18, color: '#6C757D', marginBottom: 24, lineHeight: 1.7 },
    heroButtons: { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
    heroTrust: { display: 'flex', gap: 24, fontSize: 13, color: '#6C757D', flexWrap: 'wrap' },
    heroVisual: { display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    heroIllustration: { width: '100%', maxWidth: 520, position: 'relative' },
    blobBg: { position: 'absolute', width: 450, height: 450, background: 'radial-gradient(circle, rgba(30,77,75,0.08), rgba(233,196,106,0.1))', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 },
    bookStack: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
    book: { width: 200, height: 40, borderRadius: '6px 8px 8px 6px', marginBottom: -8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', paddingLeft: 16, fontSize: 13, fontWeight: 600, color: 'white' },
    floatingPoints: { position: 'absolute', top: 30, right: 20, background: '#E9C46A', color: '#343A40', width: 80, height: 80, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 2, animation: 'float 3s ease-in-out infinite' },
    floatingCraft: { position: 'absolute', bottom: 40, left: 10, background: 'white', padding: '12px 18px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 14, fontWeight: 600, zIndex: 2, animation: 'float 3s ease-in-out 1s infinite' },
    
    howItWorks: { padding: '80px', maxWidth: 1440, margin: '0 auto', textAlign: 'center' },
    sectionTitle: { fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 },
    sectionSubtitle: { fontSize: 18, color: '#6C757D', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' },
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
    stepCard: { background: 'white', borderRadius: 16, padding: '24px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #DEE2E6', textAlign: 'center' },
    stepIcon: { width: 72, height: 72, background: '#E9C46A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: '#1E4D4B', position: 'relative' },
    stepNumber: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, background: '#E76F51', color: 'white', borderRadius: '50%', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    statsBar: { background: '#1E4D4B', padding: '48px 80px' },
    statsGrid: { maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' },
    statNumber: { 
      fontSize: 42, 
      fontWeight: 800, 
      display: 'block', 
      marginBottom: 4, 
      color: 'white',
      transition: 'all 0.3s ease',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statLabel: { 
      fontSize: 16, 
      opacity: 0.9, 
      color: 'white',
      letterSpacing: '0.5px'
    },
    
    categories: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    categoriesHeader: { textAlign: 'center', marginBottom: 48 },
    categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
    categoryCard: { background: 'white', borderRadius: 16, padding: 24, border: '1px solid #DEE2E6', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' },
    categoryIcon: { width: 60, height: 60, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 },
    
    trending: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    trendingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
    viewAll: { color: '#E76F51', textDecoration: 'none', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 4 },
    bundlesScroll: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, overflowX: 'auto' },
    bundleCard: { background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #DEE2E6', minWidth: 260 },
    bundleImage: { height: 180, background: 'linear-gradient(135deg, #E8F0EF, #D5E8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#1E4D4B', position: 'relative' },
    bundleGenreBadge: { position: 'absolute', top: 12, left: 12, background: '#E76F51', color: 'white', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600 },
    bundleStock: { position: 'absolute', top: 12, right: 12, background: 'white', color: '#E76F51', padding: '4px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
    bundleDetails: { padding: 16 },
    bundlePriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    bundlePrice: { fontSize: 20, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'center', gap: 4 },
    
    crafts: { padding: '80px', maxWidth: 1440, margin: '0 auto', background: '#F1F3F5' },
    craftsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 },
    craftCard: { background: 'white', borderRadius: 16, overflow: 'hidden' },
    craftImage: { height: 200, background: 'linear-gradient(135deg, #FFF5EC, #FFE8D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 },
    craftDetails: { padding: 16 },
    wishlistBtn: { background: 'none', border: 'none', color: '#DEE2E6', fontSize: 20, cursor: 'pointer' },
    
    testimonials: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
    testimonialCard: { background: 'rgba(233,196,106,0.08)', borderRadius: 16, padding: 24, textAlign: 'center' },
    testimonialAvatar: { width: 64, height: 64, borderRadius: '50%', background: '#E9C46A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', color: '#343A40' },
    stars: { color: '#E9C46A', marginBottom: 16 },
    
    levels: { padding: '80px', maxWidth: 1440, margin: '0 auto', textAlign: 'center', background: '#F1F3F5' },
    levelsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 },
    levelCard: { background: 'white', borderRadius: 16, padding: 24, border: '2px solid #DEE2E6', position: 'relative' },
    levelCardFeatured: { borderColor: '#E9C46A', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'scale(1.05)' },
    levelBadge: { width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
    levelBenefits: { listStyle: 'none', textAlign: 'left', fontSize: 14, color: '#343A40' },
    
    ctaBanner: { background: '#E76F51', padding: 80, textAlign: 'center' },
    ctaNote: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 16 },
    
    footer: { 
      background: '#343A40', 
      padding: '64px 80px 32px', 
      color: 'rgba(255,255,255,0.7)' 
    },
    footerGrid: { 
      maxWidth: 1440, 
      margin: '0 auto', 
      display: 'grid', 
      gridTemplateColumns: '2fr 1fr 1fr',
      gap: 48
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column'
    },
    footerLogo: { 
      fontFamily: 'Playfair Display, serif', 
      fontSize: 24, 
      color: 'white', 
      marginBottom: 16 
    },
    socialLinks: { 
      display: 'flex', 
      gap: 12
    },
    socialLink: { 
      width: 40, 
      height: 40, 
      borderRadius: '50%', 
      background: 'rgba(255,255,255,0.1)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: 'white', 
      textDecoration: 'none',
      transition: 'background 0.3s ease',
      ':hover': {
        background: 'rgba(255,255,255,0.2)'
      }
    },
    footerLinks: { 
      listStyle: 'none', 
      padding: 0,
      margin: 0
    },
    footerBottom: { 
      maxWidth: 1440, 
      margin: '48px auto 0', 
      paddingTop: 24, 
      borderTop: '1px solid rgba(255,255,255,0.1)', 
      textAlign: 'center', 
      fontSize: 13,
      color: 'rgba(255,255,255,0.5)'
    }
  };

  return (
    <div style={styles.body}>
      {/* ===== CART MESSAGE NOTIFICATION ===== */}
      {cartMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: cartMessage.includes('Failed') ? '#dc3545' : '#2A9D8F',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: 15,
          fontWeight: 500
        }}>
          {cartMessage}
        </div>
      )}

      {/* ============ HEADER ============ */}
      <Navbar variant="public" />

      {/* ============ HERO SECTION ============ */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <i className="fa-solid fa-book"></i> Projenius Book Exchange
          </div>
          <h1 style={styles.heroTitle}>
            Turn Your Shelves Into Points.<br /><span style={styles.heroTitleSpan}>Turn Points Into Treasures.</span>
          </h1>
          <p style={styles.heroDescription}>
            Donate any genre of books, earn points instantly, and browse thousands 
            of curated book bundles or handmade paper crafts. Join our sustainable 
            reading revolution.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/login?redirect=/donate" style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnLg }}>
              <i className="fa-solid fa-hand-holding-heart"></i> Start Donating
            </Link>
            <Link to="/login?redirect=/marketplace" style={{ ...styles.btn, ...styles.btnGold, ...styles.btnLg }}>
              <i className="fa-solid fa-store"></i> Explore Marketplace
            </Link>
          </div>
          <div style={styles.heroTrust}>
            <span><i className="fa-solid fa-circle-check"></i> Free to join</span>
            <span><i className="fa-solid fa-circle-check"></i> 12,450+ books donated</span>
            <span><i className="fa-solid fa-circle-check"></i> Instant points</span>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.heroIllustration}>
            <div style={styles.blobBg}></div>
            <div style={styles.bookStack}>
              <div style={{ ...styles.book, background: '#E76F51', width: 160, transform: 'rotate(-3deg)' }}><i className="fa-solid fa-book" style={{ marginRight: 8 }}></i> Fiction</div>
              <div style={{ ...styles.book, background: '#2A9D8F', width: 180, transform: 'rotate(1deg)' }}><i className="fa-solid fa-graduation-cap" style={{ marginRight: 8 }}></i> Academic</div>
              <div style={{ ...styles.book, background: '#1E4D4B', width: 200, transform: 'rotate(-2deg)' }}><i className="fa-solid fa-child" style={{ marginRight: 8 }}></i> Children's</div>
              <div style={{ ...styles.book, background: '#E9C46A', width: 175, color: '#343A40', transform: 'rotate(2deg)' }}><i className="fa-solid fa-mask" style={{ marginRight: 8 }}></i> Comics</div>
              <div style={{ ...styles.book, background: '#6C757D', width: 190, transform: 'rotate(-1deg)' }}><i className="fa-solid fa-gem" style={{ marginRight: 8 }}></i> Rare Finds</div>
            </div>
            <div style={styles.floatingPoints}>
              <i className="fa-solid fa-coins"></i> +50 pts
            </div>
            <div style={styles.floatingCraft}>
              🎨 Handmade Crafts
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How Projenius Works</h2>
        <p style={styles.sectionSubtitle}>Four simple steps to turn your books into new adventures.</p>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepIcon}>
              <i className="fa-solid fa-calendar-plus"></i>
              <span style={styles.stepNumber}>1</span>
            </div>
            <h3>Schedule Donation</h3>
            <p>Tell us what books you want to give and pick a drop-off date that works for you.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepIcon}>
              <i className="fa-solid fa-coins"></i>
              <span style={styles.stepNumber}>2</span>
            </div>
            <h3>Get Points</h3>
            <p>Staff verifies your books and credits points to your account instantly.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepIcon}>
              <i className="fa-solid fa-basket-shopping"></i>
              <span style={styles.stepNumber}>3</span>
            </div>
            <h3>Browse & Shop</h3>
            <p>Use points to grab curated book bundles or unique paper crafts.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepIcon}>
              <i className="fa-solid fa-box"></i>
              <span style={styles.stepNumber}>4</span>
            </div>
            <h3>Receive & Enjoy</h3>
            <p>We deliver right to your doorstep. Happy reading and crafting!</p>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR WITH ANIMATION ============ */}
      <section ref={statsRef} style={styles.statsBar}>
        <div style={styles.statsGrid}>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.statNumber}>
              {counters.books.toLocaleString()}+
            </span>
            <span style={styles.statLabel}>Books Donated</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.statNumber}>
              {counters.members.toLocaleString()}+
            </span>
            <span style={styles.statLabel}>Active Members</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={styles.statNumber}>
              {counters.points > 0 ? (counters.points / 1000).toFixed(1) + 'M+' : '0'}
            </span>
            <span style={styles.statLabel}>Points Earned</span>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section id="marketplace" style={styles.categories}>
        <div style={styles.categoriesHeader}>
          <h2 style={styles.sectionTitle}>Find Your Genre</h2>
          <p style={styles.sectionSubtitle}>Browse thousands of books across every category imaginable.</p>
        </div>
        <div style={styles.categoryGrid}>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(231,111,81,0.15)', color: '#E76F51' }}><i className="fa-solid fa-dragon"></i></div>
            <div><h4>Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Novels, Fantasy & more</span></div>
          </div>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(42,157,143,0.15)', color: '#2A9D8F' }}><i className="fa-solid fa-globe"></i></div>
            <div><h4>Non-Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Biographies, History & Essays</span></div>
          </div>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(30,77,75,0.12)', color: '#1E4D4B' }}><i className="fa-solid fa-graduation-cap"></i></div>
            <div><h4>Academic</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Textbooks & Reference</span></div>
          </div>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(233,196,106,0.2)', color: '#C4941A' }}><i className="fa-solid fa-crayon"></i></div>
            <div><h4>Children's</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Picture books & YA</span></div>
          </div>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(244,162,97,0.2)', color: '#F4A261' }}><i className="fa-solid fa-mask"></i></div>
            <div><h4>Comics</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Manga & Graphic Novels</span></div>
          </div>
          <div style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(230,57,70,0.1)', color: '#E63946' }}><i className="fa-solid fa-gem"></i></div>
            <div><h4>Rare Finds</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Collectibles & Special Editions</span></div>
          </div>
        </div>
      </section>

      {/* ============ TRENDING BUNDLES ============ */}
      <section style={styles.trending}>
        <div style={styles.trendingHeader}>
          <div>
            <h2 style={styles.sectionTitle}>🔥 Staff-Curated Bundles</h2>
            <p style={{ color: '#6C757D' }}>Handpicked collections by our expert staff.</p>
          </div>
          <Link to="/login?redirect=/marketplace" style={styles.viewAll}>View All <i className="fa-solid fa-arrow-right"></i></Link>
        </div>
        <div style={styles.bundlesScroll}>
          <div style={styles.bundleCard}>
            <div style={styles.bundleImage}>
              📚
              <span style={styles.bundleGenreBadge}>Romance</span>
              <span style={styles.bundleStock}>Only 3 left</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Cozy Winter Reads</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Anika</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 250</span>
                <button 
                  onClick={() => handleAddToCart({ id: 1, title: 'Cozy Winter Reads', price: 250, type: 'bundle' })}
                  style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          <div style={styles.bundleCard}>
            <div style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #E8F4F8, #D5E8E0)' }}>
              🖋️
              <span style={styles.bundleGenreBadge}>Self-Help</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Mindfulness Collection</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Raj</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 180</span>
                <button 
                  onClick={() => handleAddToCart({ id: 2, title: 'Mindfulness Collection', price: 180, type: 'bundle' })}
                  style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          <div style={styles.bundleCard}>
            <div style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #FFF0E0, #FFE0D0)' }}>
              🔬
              <span style={styles.bundleGenreBadge}>Educational</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Science Explorers Pack</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Priya</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 320</span>
                <button 
                  onClick={() => handleAddToCart({ id: 3, title: 'Science Explorers Pack', price: 320, type: 'bundle' })}
                  style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          <div style={styles.bundleCard}>
            <div style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #F0F0F8, #E0E0F0)' }}>
              🎭
              <span style={styles.bundleGenreBadge}>Classics</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Timeless Literature</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: David</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 400</span>
                <button 
                  onClick={() => handleAddToCart({ id: 4, title: 'Timeless Literature', price: 400, type: 'bundle' })}
                  style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HANDMADE CRAFTS ============ */}
      <section style={styles.crafts}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={styles.sectionTitle}>🎨 Handmade Paper Creations</h2>
          <p style={styles.sectionSubtitle}>Unique crafts made by talented community members.</p>
        </div>
        <div style={styles.craftsGrid}>
          <div style={styles.craftCard}>
            <div style={styles.craftImage}>📖</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Priya S.</p>
              <h4>Hand-Painted Bookmarks (Set of 5)</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 75</span>
                <button 
                  onClick={() => handleAddToCart({ id: 5, title: 'Hand-Painted Bookmarks', price: 75, type: 'craft' })}
                  style={styles.wishlistBtn}
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          <div style={styles.craftCard}>
            <div style={styles.craftImage}>🎴</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Arjun K.</p>
              <h4>Origami Wall Art Set</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 120</span>
                <button 
                  onClick={() => handleAddToCart({ id: 6, title: 'Origami Wall Art Set', price: 120, type: 'craft' })}
                  style={styles.wishlistBtn}
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          <div style={styles.craftCard}>
            <div style={styles.craftImage}>📓</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Meera L.</p>
              <h4>Recycled Paper Journal</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 90</span>
                <button 
                  onClick={() => handleAddToCart({ id: 7, title: 'Recycled Paper Journal', price: 90, type: 'craft' })}
                  style={styles.wishlistBtn}
                >
                  <i className="fa-regular fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section style={styles.testimonials}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={styles.sectionTitle}>What Our Readers Say</h2>
          <p style={styles.sectionSubtitle}>Join thousands of happy book lovers and crafters.</p>
        </div>
        <div style={styles.testimonialGrid}>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>👩</div>
            <div style={styles.stars}>★★★★★</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>"I decluttered my shelf and got enough points to buy a rare poetry bundle. This is genius!"</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Ananya S.</p>
            <p style={{ fontSize: 13, color: '#6C757D' }}>Donated 45 books</p>
          </div>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>👨</div>
            <div style={styles.stars}>★★★★★</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>"Selling my paper crafts here connected me with readers who truly appreciate handmade art."</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Vikram R.</p>
            <p style={{ fontSize: 13, color: '#6C757D' }}>Craft Seller</p>
          </div>
          <div style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>👩‍🎓</div>
            <div style={styles.stars}>★★★★★</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>"As a student, being able to exchange textbooks for points is a lifesaver. Highly recommend!"</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Fatima K.</p>
            <p style={{ fontSize: 13, color: '#6C757D' }}>Student</p>
          </div>
        </div>
      </section>

      {/* ============ LEVELS ============ */}
      <section style={styles.levels}>
        <h2 style={styles.sectionTitle}>Level Up Your Reading</h2>
        <p style={styles.sectionSubtitle}>Earn more benefits as you donate and engage.</p>
        <div style={styles.levelsGrid}>
          <div style={styles.levelCard}>
            <div style={{ ...styles.levelBadge, background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)', color: '#666' }}>📚</div>
            <h3>Book Lover</h3>
            <p style={{ fontSize: 14, color: '#6C757D', marginBottom: 16 }}>0 — 250 Points</p>
            <ul style={styles.levelBenefits}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Early bundle access</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Profile badge</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Standard delivery</li>
            </ul>
          </div>
          <div style={{ ...styles.levelCard, ...styles.levelCardFeatured }}>
            <div style={{ ...styles.levelBadge, background: 'linear-gradient(135deg, #E9C46A, #F2D98A)', color: '#7A5C10', boxShadow: '0 0 20px rgba(233,196,106,0.5)' }}>🥇</div>
            <h3>Bibliophile</h3>
            <p style={{ fontSize: 14, color: '#6C757D', marginBottom: 16 }}>251 — 750 Points</p>
            <ul style={styles.levelBenefits}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> +10% bonus points on donations</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Priority support</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Exclusive bundles</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Free shipping on orders over 200 pts</li>
            </ul>
          </div>
          <div style={styles.levelCard}>
            <div style={{ ...styles.levelBadge, background: 'linear-gradient(135deg, #B8E6E4, #1E4D4B)', color: 'white', boxShadow: '0 0 20px rgba(30,77,75,0.5)' }}>💎</div>
            <h3>Grand Librarian</h3>
            <p style={{ fontSize: 14, color: '#6C757D', marginBottom: 16 }}>751+ Points</p>
            <ul style={styles.levelBenefits}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> +20% bonus points on donations</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Free delivery always</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Custom profile frame</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Early access to all new arrivals</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> VIP support line</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ color: '#6C757D', marginBottom: 8, fontSize: 14 }}>📊 300 pts to Bibliophile</p>
          <div style={{ background: '#DEE2E6', height: 8, borderRadius: 4, maxWidth: 300, margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ background: '#E9C46A', height: '100%', width: '40%', borderRadius: 4 }}></div>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section style={styles.ctaBanner}>
        <h2 style={{ color: 'white', fontSize: 36, marginBottom: 16 }}>Ready to Give Your Books a New Story?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 24 }}>Join thousands of readers and crafters building a library without walls.</p>
        <Link to="/signup" style={{ ...styles.btn, background: 'white', color: '#E76F51', borderColor: 'white', fontSize: 18, padding: '16px 36px' }}>
          <i className="fa-solid fa-gift"></i> Sign Up Free — Earn 50 Bonus Points
        </Link>
        <p style={styles.ctaNote}>No credit card. Just books and good vibes.</p>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="about" style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <div style={styles.footerLogo}>ShareShelf</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Building a sustainable ecosystem to reduce book waste, promote literacy, 
              and create a circular economy for books through donations and point-based exchanges.
            </p>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" style={styles.socialLink}><i className="fa-brands fa-twitter"></i></a>
              <a href="#" style={styles.socialLink}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" style={styles.socialLink}><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}>
                <Link to="/login?redirect=/donate" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
                  Donate Books
                </Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <Link to="/login?redirect=/marketplace" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
                  Marketplace
                </Link>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
                  How It Works
                </a>
              </li>
              <li style={{ marginBottom: 8 }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Contact</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-envelope"></i> shareshelf@gmail.com</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-phone"></i> +94 71 350 6062</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-location-dot"></i> Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2025 ShareShelf. Built with ❤️ for book lovers everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;