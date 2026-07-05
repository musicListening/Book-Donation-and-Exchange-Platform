import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../styles/HomePage.css';

const Home = () => {
  const pageRef = useRef(null);

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

    // Scroll-reveal IntersectionObserver
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
      marginRight: '40px' // Add space between logo and nav links
    },
    navLinks: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: 32, 
      listStyle: 'none', 
      margin: 0, 
      padding: 0,
      flex: 1, // Takes remaining space
      justifyContent: 'center' // Center the nav links
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
      marginLeft: 'auto' // Pushes actions to the right
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
    
    // Rest of your styles remain the same...
    btn: { display: 'inlineFlex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: 16, fontWeight: 600, borderRadius: 12, border: '2px solid transparent', cursor: 'pointer', textDecoration: 'none' },
    btnPrimary: { backgroundColor: '#1E4D4B', color: 'white', borderColor: '#1E4D4B' },
    btnSecondary: { backgroundColor: 'transparent', color: '#1E4D4B', borderColor: '#1E4D4B' },
    btnGold: { backgroundColor: '#E9C46A', color: '#343A40', borderColor: '#E9C46A' },
    btnSm: { padding: '8px 16px', fontSize: 14 },
    btnLg: { padding: '18px 36px', fontSize: 18 },
    
    heroSection: {
      width: '100%',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 0 60px 0',
      position: 'relative',
      background: '#0a1f1e',
      overflow: 'hidden',
    },
    hero: { padding: '0 80px', maxWidth: 1440, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center', zIndex: 10, position: 'relative' },
    heroContent: { 
      maxWidth: 580, 
      background: 'rgba(255, 255, 255, 0.08)', 
      backdropFilter: 'blur(20px)', 
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)', 
      borderRadius: 24, 
      padding: '36px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      textAlign: 'left',
      position: 'relative',
      zIndex: 10,
    },
    heroBadge: { 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 8, 
      background: 'rgba(255, 255, 255, 0.15)', 
      color: '#ffffff', 
      padding: '8px 16px', 
      borderRadius: 50, 
      fontSize: 13, 
      fontWeight: 700, 
      textTransform: 'uppercase', 
      letterSpacing: 2, 
      alignSelf: 'flex-start',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    heroTitle: { fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 0, color: '#ffffff', fontFamily: 'Playfair Display, serif' },
    heroTitleSpan: { color: '#E9C46A' },
    heroDescription: { fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 0, lineHeight: 1.6 },
    heroButtons: { display: 'flex', gap: 16, marginBottom: 0, flexWrap: 'wrap' },
    heroTrust: { display: 'flex', gap: 10, fontSize: 12, color: '#ffffff', flexWrap: 'wrap', marginTop: 4 },
    heroTrustBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '6px 12px',
      borderRadius: 50,
      color: '#ffffff',
      fontWeight: 600
    },
    heroVisual: { display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', height: '520px', zIndex: 10 },
    heroCollage: { position: 'relative', width: '100%', height: '100%', maxWidth: '480px' },
    hexagonWrapper1: {
      position: 'absolute',
      width: 280,
      height: 320,
      top: 10,
      left: 100,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      background: 'rgba(255, 255, 255, 0.25)',
      padding: '4px',
      zIndex: 2
    },
    hexagonWrapper2: {
      position: 'absolute',
      width: 200,
      height: 230,
      bottom: 20,
      left: 0,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      background: 'rgba(255, 255, 255, 0.25)',
      padding: '4px',
      zIndex: 3
    },
    hexagonWrapper3: {
      position: 'absolute',
      width: 220,
      height: 250,
      bottom: 10,
      right: 0,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      background: 'rgba(255, 255, 255, 0.25)',
      padding: '4px',
      zIndex: 1
    },
    hexagonWrapper4: {
      position: 'absolute',
      width: 150,
      height: 173,
      top: 40,
      right: 40,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      background: 'rgba(255, 255, 255, 0.25)',
      padding: '4px',
      zIndex: 1
    },
    hexagonInner: {
      width: '100%',
      height: '100%',
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      background: '#1E4D4B',
      overflow: 'hidden'
    },
    collageImg: { width: '100%', height: '100%', objectFit: 'cover' },
    
    howItWorks: { padding: '80px', maxWidth: 1440, margin: '0 auto', textAlign: 'center' },
    sectionTitle: { fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 },
    sectionSubtitle: { fontSize: 18, color: '#6C757D', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' },
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
    stepCard: { background: 'white', borderRadius: 24, padding: '36px 24px', boxShadow: '0 6px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', transition: 'all 0.35s ease' },
    stepIcon: { width: 80, height: 80, background: 'linear-gradient(135deg, #E9C46A, #F2D98A)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 30, color: '#1E4D4B', position: 'relative', boxShadow: '0 8px 24px rgba(233,196,106,0.35)' },
    stepNumber: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, background: '#E76F51', color: 'white', borderRadius: '50%', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(231,111,81,0.4)' },
    
    statsBar: { background: 'linear-gradient(135deg, #1E4D4B 0%, #163836 50%, #0f2624 100%)', padding: '60px 80px' },
    statsGrid: { maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' },
    statNumber: { fontSize: 42, fontWeight: 800, display: 'block', marginBottom: 4, color: 'white' },
    statLabel: { fontSize: 16, opacity: 0.9, color: 'white' },
    
    categories: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    categoriesHeader: { textAlign: 'center', marginBottom: 48 },
    categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
    categoryCard: { background: 'white', borderRadius: 20, padding: '20px 24px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.35s ease' },
    categoryIcon: { width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 },
    
    trending: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    trendingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
    viewAll: { color: '#E76F51', textDecoration: 'none', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 4 },
    bundlesScroll: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, overflowX: 'auto' },
    bundleCard: { background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', minWidth: 260, boxShadow: '0 6px 28px rgba(0,0,0,0.08)', transition: 'all 0.35s ease' },
    bundleImage: { height: 190, background: 'linear-gradient(135deg, #E8F0EF, #D5E8D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, color: '#1E4D4B', position: 'relative' },
    bundleGenreBadge: { position: 'absolute', top: 12, left: 12, background: '#E76F51', color: 'white', padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600 },
    bundleStock: { position: 'absolute', top: 12, right: 12, background: 'white', color: '#E76F51', padding: '4px 10px', borderRadius: 50, fontSize: 12, fontWeight: 700 },
    bundleDetails: { padding: 16 },
    bundlePriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    bundlePrice: { fontSize: 20, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'center', gap: 4 },
    
    crafts: { padding: '80px', maxWidth: 1440, margin: '0 auto', background: 'linear-gradient(180deg, #F8F9FA, #F1F3F5)' },
    craftsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 48 },
    craftCard: { background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 6px 28px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', transition: 'all 0.35s ease' },
    craftImage: { height: 210, background: 'linear-gradient(135deg, #FFF5EC, #FFE8D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 },
    craftDetails: { padding: '20px 20px 16px' },
    wishlistBtn: { background: 'none', border: 'none', color: '#DEE2E6', fontSize: 20, cursor: 'pointer' },
    
    testimonials: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 },
    testimonialCard: { background: 'white', borderRadius: 24, padding: 36, textAlign: 'center', boxShadow: '0 6px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', borderTop: '4px solid #E9C46A', transition: 'all 0.35s ease' },
    testimonialAvatar: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #E9C46A, #F2D98A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', color: '#343A40', boxShadow: '0 6px 20px rgba(233,196,106,0.3)' },
    stars: { color: '#E9C46A', marginBottom: 16 },
    
    levels: { padding: '80px', maxWidth: 1440, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(180deg, #F1F3F5, #F8F9FA)' },
    levelsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 48 },
    levelCard: { background: 'white', borderRadius: 24, padding: '36px 28px', border: '2px solid rgba(0,0,0,0.05)', position: 'relative', boxShadow: '0 6px 28px rgba(0,0,0,0.07)', transition: 'all 0.35s ease' },
    levelCardFeatured: { borderColor: '#E9C46A', boxShadow: '0 16px 45px rgba(233,196,106,0.2)', transform: 'scale(1.04)' },
    levelBadge: { width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
    levelBenefits: { listStyle: 'none', textAlign: 'left', fontSize: 14, color: '#343A40' },
    
    ctaBanner: { background: 'linear-gradient(135deg, #E76F51 0%, #D45D3F 60%, #C44F32 100%)', padding: 80, textAlign: 'center' },
    ctaNote: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 16 },
    
    footer: { background: '#343A40', padding: '64px 80px 32px', color: 'rgba(255,255,255,0.7)' },
    footerGrid: { maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 32 },
    footerLogo: { fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'white', marginBottom: 16 },
    socialLinks: { display: 'flex', gap: 16 },
    socialLink: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' },
    footerLinks: { listStyle: 'none', padding: 0 },
    footerBottom: { maxWidth: 1440, margin: '48px auto 0', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: 13 }
  };

  return (
    <div style={styles.body}>
      {/* ============ HEADER ============ */}
      <Navbar variant="public" />

      {/* Rest of your sections remain exactly the same */}
      {/* ... (keep all the other sections unchanged) ... */}
      
      {/* ============ HERO SECTION ============ */}
      <section className="hero-section-bg" style={styles.heroSection}>
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1920" 
          alt="Library Background"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 1.0, zIndex: 0, pointerEvents: 'none' }} 
        />
        {/* Ambient particles */}
        <div className="hero-particle hero-particle--1"></div>
        <div className="hero-particle hero-particle--2"></div>
        <div className="hero-particle hero-particle--3"></div>
        
        {/* Floating Hexagon on the left corner */}
        <div className="hexagon-wrapper-4" style={styles.hexagonWrapper4}>
          <div style={styles.hexagonInner}>
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600" alt="Aesthetic Bookshelf" style={styles.collageImg} />
          </div>
        </div>

        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div className="hero-badge-shimmer hero-enter hero-enter--delay-1" style={styles.heroBadge}>
              <i className="fa-solid fa-book"></i> Projenius Book Exchange
            </div>
            <h1 className="hero-enter hero-enter--delay-2" style={styles.heroTitle}>
              Turn Your Shelves Into Points.<br /><span style={styles.heroTitleSpan}>Turn Points Into Treasures.</span>
            </h1>
            <p className="hero-enter hero-enter--delay-3" style={styles.heroDescription}>
              Donate any genre of books, earn points instantly, and browse thousands 
              of curated book bundles or handmade paper crafts. Join our sustainable 
              reading revolution.
            </p>
            <div className="hero-enter hero-enter--delay-4" style={styles.heroButtons}>
              <Link to="/donate" className="hero-btn-primary" style={{ ...styles.btn, backgroundColor: '#ffffff', color: '#1E4D4B', border: 'none', boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)' }}>
                <i className="fa-solid fa-hand-holding-heart"></i> Start Donating
              </Link>
              <Link to="/marketplace" className="hero-btn-secondary" style={{ ...styles.btn, backgroundColor: 'transparent', color: '#ffffff', border: '2px solid rgba(255, 255, 255, 0.4)' }}>
                <i className="fa-solid fa-store"></i> Explore Marketplace
              </Link>
            </div>
            <div className="hero-enter hero-enter--delay-5" style={styles.heroTrust}>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> Free to join</span>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> 12,450+ books donated</span>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> Instant points</span>
            </div>
          </div>
          <div className="hero-visual-enter" style={styles.heroVisual}>
            <div style={styles.heroCollage}>
              <div className="hexagon-wrapper-1" style={styles.hexagonWrapper1}>
                <div style={styles.hexagonInner}>
                  <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600" alt="Beautiful Library" style={styles.collageImg} />
                </div>
              </div>
              <div className="hexagon-wrapper-2" style={styles.hexagonWrapper2}>
                <div style={styles.hexagonInner}>
                  <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600" alt="Open Book" style={styles.collageImg} />
                </div>
              </div>
              <div className="hexagon-wrapper-3" style={styles.hexagonWrapper3}>
                <div style={styles.hexagonInner}>
                  <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600" alt="Book and Coffee" style={styles.collageImg} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" style={styles.howItWorks}>
        <h2 className="reveal" style={styles.sectionTitle}>How Projenius Works</h2>
        <p className="reveal" style={styles.sectionSubtitle}>Four simple steps to turn your books into new adventures.</p>
        <div className="reveal-stagger" style={styles.stepsGrid}>
          <div className="card-hover-lift" style={styles.stepCard}>
            <div className="step-icon-hover" style={styles.stepIcon}>
              <i className="fa-solid fa-calendar-plus"></i>
              <span style={styles.stepNumber}>1</span>
            </div>
            <h3>Schedule Donation</h3>
            <p>Tell us what books you want to give and pick a drop-off date that works for you.</p>
          </div>
          <div className="card-hover-lift" style={styles.stepCard}>
            <div className="step-icon-hover" style={styles.stepIcon}>
              <i className="fa-solid fa-coins"></i>
              <span style={styles.stepNumber}>2</span>
            </div>
            <h3>Get Points</h3>
            <p>Staff verifies your books and credits points to your account instantly.</p>
          </div>
          <div className="card-hover-lift" style={styles.stepCard}>
            <div className="step-icon-hover" style={styles.stepIcon}>
              <i className="fa-solid fa-basket-shopping"></i>
              <span style={styles.stepNumber}>3</span>
            </div>
            <h3>Browse & Shop</h3>
            <p>Use points to grab curated book bundles or unique paper crafts.</p>
          </div>
          <div className="card-hover-lift" style={styles.stepCard}>
            <div className="step-icon-hover" style={styles.stepIcon}>
              <i className="fa-solid fa-box"></i>
              <span style={styles.stepNumber}>4</span>
            </div>
            <h3>Receive & Enjoy</h3>
            <p>We deliver right to your doorstep. Happy reading and crafting!</p>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section style={styles.statsBar}>
        <div className="reveal-stagger" style={styles.statsGrid}>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>📦 12,450+</span>
            <span style={styles.statLabel}>Books Donated</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>👥 3,800+</span>
            <span style={styles.statLabel}>Active Members</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>🪙 1.2M+</span>
            <span style={styles.statLabel}>Points Earned</span>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section id="marketplace" style={styles.categories}>
        <div style={styles.categoriesHeader}>
          <h2 className="reveal" style={styles.sectionTitle}>Find Your Genre</h2>
          <p className="reveal" style={styles.sectionSubtitle}>Browse thousands of books across every category imaginable.</p>
        </div>
        <div className="reveal-stagger" style={styles.categoryGrid}>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(231,111,81,0.15)', color: '#E76F51' }}><i className="fa-solid fa-dragon"></i></div>
            <div><h4>Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Novels, Fantasy & more</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(42,157,143,0.15)', color: '#2A9D8F' }}><i className="fa-solid fa-globe"></i></div>
            <div><h4>Non-Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Biographies, History & Essays</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(30,77,75,0.12)', color: '#1E4D4B' }}><i className="fa-solid fa-graduation-cap"></i></div>
            <div><h4>Academic</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Textbooks & Reference</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(233,196,106,0.2)', color: '#C4941A' }}><i className="fa-solid fa-crayon"></i></div>
            <div><h4>Children's</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Picture books & YA</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(244,162,97,0.2)', color: '#F4A261' }}><i className="fa-solid fa-mask"></i></div>
            <div><h4>Comics</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Manga & Graphic Novels</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(230,57,70,0.1)', color: '#E63946' }}><i className="fa-solid fa-gem"></i></div>
            <div><h4>Rare Finds</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Collectibles & Special Editions</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
        </div>
      </section>

      {/* ============ TRENDING BUNDLES ============ */}
      <section style={styles.trending}>
        <div className="reveal" style={styles.trendingHeader}>
          <div>
            <h2 style={styles.sectionTitle}>🔥 Staff-Curated Bundles</h2>
            <p style={{ color: '#6C757D' }}>Handpicked collections by our expert staff.</p>
          </div>
          <a href="#" style={styles.viewAll}>View All <i className="fa-solid fa-arrow-right"></i></a>
        </div>
        <div className="reveal-stagger" style={styles.bundlesScroll}>
          <div className="card-hover-lift" style={styles.bundleCard}>
            <div className="bundle-img-zoom" style={styles.bundleImage}>
              📚
              <span style={styles.bundleGenreBadge}>Romance</span>
              <span style={styles.bundleStock}>Only 3 left</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Cozy Winter Reads</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Anika</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 250</span>
                <a href="#" style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}>Add to Cart</a>
              </div>
            </div>
          </div>
          <div className="card-hover-lift" style={styles.bundleCard}>
            <div className="bundle-img-zoom" style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #E8F4F8, #D5E8E0)' }}>
              🖋️
              <span style={styles.bundleGenreBadge}>Self-Help</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Mindfulness Collection</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Raj</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 180</span>
                <a href="#" style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}>Add to Cart</a>
              </div>
            </div>
          </div>
          <div className="card-hover-lift" style={styles.bundleCard}>
            <div className="bundle-img-zoom" style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #FFF0E0, #FFE0D0)' }}>
              🔬
              <span style={styles.bundleGenreBadge}>Educational</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Science Explorers Pack</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: Priya</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 320</span>
                <a href="#" style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}>Add to Cart</a>
              </div>
            </div>
          </div>
          <div className="card-hover-lift" style={styles.bundleCard}>
            <div className="bundle-img-zoom" style={{ ...styles.bundleImage, background: 'linear-gradient(135deg, #F0F0F8, #E0E0F0)' }}>
              🎭
              <span style={styles.bundleGenreBadge}>Classics</span>
            </div>
            <div style={styles.bundleDetails}>
              <h4>Timeless Literature</h4>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>Curated by: David</p>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 400</span>
                <a href="#" style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSm }}>Add to Cart</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HANDMADE CRAFTS ============ */}
      <section style={styles.crafts}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 className="reveal" style={styles.sectionTitle}>🎨 Handmade Paper Creations</h2>
          <p className="reveal" style={styles.sectionSubtitle}>Unique crafts made by talented community members.</p>
        </div>
        <div className="reveal-stagger" style={styles.craftsGrid}>
          <div className="card-hover-lift" style={styles.craftCard}>
            <div className="bundle-img-zoom" style={styles.craftImage}>📖</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Priya S.</p>
              <h4>Hand-Painted Bookmarks (Set of 5)</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 75</span>
                <button className="wishlist-heart" style={styles.wishlistBtn}><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
          <div className="card-hover-lift" style={styles.craftCard}>
            <div className="bundle-img-zoom" style={styles.craftImage}>🎴</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Arjun K.</p>
              <h4>Origami Wall Art Set</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 120</span>
                <button className="wishlist-heart" style={styles.wishlistBtn}><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
          <div className="card-hover-lift" style={styles.craftCard}>
            <div className="bundle-img-zoom" style={styles.craftImage}>📓</div>
            <div style={styles.craftDetails}>
              <p style={{ fontSize: 12, color: '#6C757D', marginBottom: 4 }}>by Meera L.</p>
              <h4>Recycled Paper Journal</h4>
              <div style={styles.bundlePriceRow}>
                <span style={styles.bundlePrice}><i className="fa-solid fa-coins"></i> 90</span>
                <button className="wishlist-heart" style={styles.wishlistBtn}><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section style={styles.testimonials}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="reveal" style={styles.sectionTitle}>What Our Readers Say</h2>
          <p className="reveal" style={styles.sectionSubtitle}>Join thousands of happy book lovers and crafters.</p>
        </div>
        <div className="reveal-stagger" style={styles.testimonialGrid}>
          <div className="testimonial-hover" style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>👩</div>
            <div style={styles.stars}>★★★★★</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>"I decluttered my shelf and got enough points to buy a rare poetry bundle. This is genius!"</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Ananya S.</p>
            <p style={{ fontSize: 13, color: '#6C757D' }}>Donated 45 books</p>
          </div>
          <div className="testimonial-hover" style={styles.testimonialCard}>
            <div style={styles.testimonialAvatar}>👨</div>
            <div style={styles.stars}>★★★★★</div>
            <p style={{ fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.6 }}>"Selling my paper crafts here connected me with readers who truly appreciate handmade art."</p>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Vikram R.</p>
            <p style={{ fontSize: 13, color: '#6C757D' }}>Craft Seller</p>
          </div>
          <div className="testimonial-hover" style={styles.testimonialCard}>
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
        <h2 className="reveal" style={styles.sectionTitle}>Level Up Your Reading</h2>
        <p className="reveal" style={styles.sectionSubtitle}>Earn more benefits as you donate and engage.</p>
        <div className="reveal-stagger" style={styles.levelsGrid}>
          <div className="level-hover" style={styles.levelCard}>
            <div style={{ ...styles.levelBadge, background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)', color: '#666' }}>📚</div>
            <h3>Book Lover</h3>
            <p style={{ fontSize: 14, color: '#6C757D', marginBottom: 16 }}>0 — 250 Points</p>
            <ul style={styles.levelBenefits}>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Early bundle access</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Profile badge</li>
              <li style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-check" style={{ color: '#2A9D8F' }}></i> Standard delivery</li>
            </ul>
          </div>
          <div className="level-hover" style={{ ...styles.levelCard, ...styles.levelCardFeatured }}>
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
          <div className="level-hover" style={styles.levelCard}>
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
        <div className="reveal" style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ color: '#6C757D', marginBottom: 8, fontSize: 14 }}>📊 300 pts to Bibliophile</p>
          <div style={{ background: '#DEE2E6', height: 8, borderRadius: 4, maxWidth: 300, margin: '0 auto', overflow: 'hidden' }}>
            <div className="progress-animate" style={{ background: '#E9C46A', height: '100%', width: '40%', borderRadius: 4 }}></div>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-pulse" style={styles.ctaBanner}>
        <h2 className="reveal" style={{ color: 'white', fontSize: 36, marginBottom: 16, position: 'relative', zIndex: 1 }}>Ready to Give Your Books a New Story?</h2>
        <p className="reveal" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 24, position: 'relative', zIndex: 1 }}>Join thousands of readers and crafters building a library without walls.</p>
        <Link to="/signup" className="reveal" style={{ ...styles.btn, background: 'white', color: '#E76F51', borderColor: 'white', fontSize: 18, padding: '16px 36px', position: 'relative', zIndex: 1 }}>
          <i className="fa-solid fa-gift"></i> Sign Up Free — Earn 50 Bonus Points
        </Link>
        <p className="reveal" style={{ ...styles.ctaNote, position: 'relative', zIndex: 1 }}>No credit card. Just books and good vibes.</p>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="about" style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <div style={styles.footerLogo}>📚 Projenius</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Building a sustainable ecosystem to reduce book waste, promote literacy, 
              and create a circular economy for books through donations and point-based exchanges.
            </p>
            <div style={styles.socialLinks}>
              <a href="#" className="social-hover" style={styles.socialLink}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-hover" style={styles.socialLink}><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="social-hover" style={styles.socialLink}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-hover" style={styles.socialLink}><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}><Link to="/donate" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Donate Books</Link></li>
              <li style={{ marginBottom: 8 }}><Link to="/marketplace" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Marketplace</Link></li>
              <li style={{ marginBottom: 8 }}><a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>How It Works</a></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Staff & Admin</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}><Link to="/staff-login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Staff Portal</Link></li>
              <li style={{ marginBottom: 8 }}><Link to="/admin-login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Admin Dashboard</Link></li>
              <li style={{ marginBottom: 8 }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Contact</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-envelope"></i> hello@projenius.com</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-phone"></i> +91 98765 43210</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-location-dot"></i> Bangalore, India</li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2025 Projenius. Built with ❤️ for book lovers everywhere.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;