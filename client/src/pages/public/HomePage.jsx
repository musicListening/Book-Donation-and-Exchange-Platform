import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';
import '../../styles/HomePage.css';

// Podium styling for the top three donors
const MEDALS = {
  1: { color: '#E9C46A', gradient: 'linear-gradient(135deg, #E9C46A, #F2D98A)', glow: 'rgba(233,196,106,0.30)' },
  2: { color: '#C0C0C0', gradient: 'linear-gradient(135deg, #B8B8B8, #E8E8E8)', glow: 'rgba(184,184,184,0.30)' },
  3: { color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32, #E3A76B)', glow: 'rgba(205,127,50,0.30)' },
};

const PODIUM_ORDER = { 1: 2, 2: 1, 3: 3 };

const avatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 62%, 46%)`;
};

const Avatar = ({ donor, style }) =>
  donor.profileImage ? (
    <img src={donor.profileImage} alt={donor.name} style={style} />
  ) : (
    <div style={{ ...style, background: avatarColor(donor.name) }}>
      {donor.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );

const Home = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();

  // ── Stats state ──
  const [stats, setStats] = useState({ booksDonated: 0, activeMembers: 0, pointsEarned: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const [topReviews, setTopReviews] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const statsRef = useRef(null);

  // ── Animated counter hook ──
  const useCountUp = (target, duration = 2000, start = false) => {
    const [value, setValue] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
      if (!start || target <= 0) return;
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, start]);

    return value;
  };

  // ── Fetch real stats from API ──
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch(`${API_URL}/stats/leaderboard?limit=10`)
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setBoardLoading(false));

    fetch(`${API_URL}/reviews/top`)
      .then(res => res.json())
      .then(data => setTopReviews(data))
      .catch(() => {});
  }, []);

  // ── IntersectionObserver to trigger counter animation ──
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animatedBooks = useCountUp(stats.booksDonated, 2200, statsVisible);
  const animatedMembers = useCountUp(stats.activeMembers, 2200, statsVisible);
  const animatedPoints = useCountUp(stats.pointsEarned, 2200, statsVisible);

  // navigation helper
  const navTo = useCallback((path) => navigate(path), [navigate]);

  // Auth modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState(null);
  const [authMode, setAuthMode] = useState('login');

  const openAuthModal = (mode = 'login', redirect = null) => {
    const token = localStorage.getItem('token');
    if (token && redirect) {
      navigate(redirect);
      return;
    }
    setAuthMode(mode || 'login');
    setAuthRedirect(redirect);
    setAuthOpen(true);
  };

  const handleProtectedAction = (path) => openAuthModal('login', path);

  // ── Format numbers for display ──
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return num.toLocaleString();
    return num.toString();
  };

  useEffect(() => {
    if (window.location.pathname === '/login') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      openAuthModal('login', redirectPath);
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

  // Scroll-reveal IntersectionObserver. Re-runs when async sections (leaderboard,
  // reviews) mount so their cards get observed too instead of staying hidden.
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal:not(.revealed), .reveal-stagger:not(.revealed)');
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
  }, [leaderboard, topReviews]);

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
    
    leaderboard: { maxWidth: 1440, margin: '0 auto' },
    podium: { display: 'grid', gap: 28, alignItems: 'end', marginBottom: 40 },
    podiumCard: { background: 'white', borderRadius: 24, padding: '32px 24px', textAlign: 'center', boxShadow: '0 6px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', position: 'relative', transition: 'all 0.35s ease' },
    podiumMedal: { position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', boxShadow: '0 6px 18px rgba(0,0,0,0.18)' },
    podiumAvatar: { width: 84, height: 84, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'white', margin: '18px auto 16px', fontWeight: 'bold', objectFit: 'cover' },
    donorBooks: { fontSize: 34, fontWeight: 800, color: '#1E4D4B', lineHeight: 1.1, marginTop: 16 },
    donorPoints: { marginTop: 12, fontSize: 13, color: '#E76F51', fontWeight: 600 },
    rankList: { background: 'white', borderRadius: 24, boxShadow: '0 6px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' },
    rankRow: { display: 'grid', alignItems: 'center', gap: 16, borderTop: '1px solid #F1F3F5' },
    rankNum: { fontSize: 18, fontWeight: 800, color: '#ADB5BD', textAlign: 'center' },
    rankAvatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: 'white', fontWeight: 'bold', objectFit: 'cover' },
    donorName: { margin: 0, fontSize: 17, color: '#343A40', fontWeight: 700 },
    donorTier: { fontSize: 13, color: '#6C757D', marginTop: 4, display: 'inline-block' },
    donorBooksLabel: { fontSize: 13, color: '#6C757D', letterSpacing: 0.4, textTransform: 'uppercase' },
    rankBooks: { fontSize: 18, fontWeight: 800, color: '#1E4D4B', whiteSpace: 'nowrap' },
    emptyBoard: { textAlign: 'center', padding: '48px 0', color: '#6C757D' },
    boardSkeleton: { background: 'linear-gradient(100deg, #F1F3F5 30%, #F8F9FA 50%, #F1F3F5 70%)', backgroundSize: '200% 100%', animation: 'boardShimmer 1.4s ease-in-out infinite', boxShadow: 'none' },
    
    testimonials: { padding: '80px', maxWidth: 1440, margin: '0 auto' },
    testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 },
    testimonialCard: { background: 'white', borderRadius: 24, padding: 36, textAlign: 'center', boxShadow: '0 6px 30px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)', borderTop: '4px solid #E9C46A', transition: 'all 0.35s ease' },
    testimonialAvatar: { width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', margin: '0 auto 16px', fontWeight: 'bold', objectFit: 'cover' },
    testimonialAuthor: { marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    authorName: { margin: 0, fontSize: 16, color: '#343A40', fontWeight: 700 },
    authorRole: { fontSize: 13, color: '#6C757D', marginTop: 4 },
    testimonialText: { fontSize: 15, color: '#495057', fontStyle: 'italic', lineHeight: 1.6 },
    stars: { color: '#E9C46A', marginBottom: 16 },
    
    leaderboard: { padding: '80px', maxWidth: 1440, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(180deg, #F1F3F5, #F8F9FA)' },
    podiumGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 48, alignItems: 'end' },
    podiumCard: { background: 'white', borderRadius: 24, padding: '36px 28px', border: '2px solid rgba(0,0,0,0.05)', position: 'relative', boxShadow: '0 6px 28px rgba(0,0,0,0.07)', transition: 'all 0.35s ease' },
    podiumCardFirst: { borderColor: '#E9C46A', boxShadow: '0 16px 45px rgba(233,196,106,0.2)', transform: 'scale(1.04)' },
    podiumMedal: { width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
    podiumAvatar: { width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', fontWeight: 'bold', objectFit: 'cover' },
    podiumName: { margin: 0, fontSize: 18, fontWeight: 700, color: '#343A40' },
    podiumTier: { fontSize: 13, color: '#6C757D', marginTop: 4 },
    podiumCount: { fontSize: 32, fontWeight: 800, color: '#1E4D4B', marginTop: 16, lineHeight: 1.1 },
    podiumCountLabel: { fontSize: 13, color: '#6C757D', textTransform: 'uppercase', letterSpacing: 0.6 },
    boardList: { marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' },
    boardRow: { background: 'white', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 18px rgba(0,0,0,0.05)', transition: 'all 0.35s ease' },
    boardRank: { width: 32, flexShrink: 0, fontSize: 16, fontWeight: 800, color: '#6C757D', textAlign: 'center' },
    boardAvatar: { width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white', fontWeight: 'bold', objectFit: 'cover' },
    boardName: { margin: 0, fontSize: 15, fontWeight: 700, color: '#343A40' },
    boardTier: { fontSize: 12, color: '#6C757D', marginTop: 2 },
    boardCount: { marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: '#1E4D4B', display: 'flex', alignItems: 'baseline', gap: 6 },
    boardCountLabel: { fontSize: 12, fontWeight: 600, color: '#6C757D' },
    
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

        <div className="hero" style={styles.hero}>
          <div className="hero-content" style={styles.heroContent}>
            <div className="hero-badge-shimmer hero-enter hero-enter--delay-1 hero-badge" style={styles.heroBadge}>
              <i className="fa-solid fa-book"></i> ShareShelf Book Exchange
            </div>
            <h1 className="hero-enter hero-enter--delay-2 hero-title" style={styles.heroTitle}>
              Turn Your Shelves Into Points.<br /><span style={styles.heroTitleSpan}>Turn Points Into Treasures.</span>
            </h1>
            <p className="hero-enter hero-enter--delay-3 hero-description" style={styles.heroDescription}>
              Donate any genre of books, earn points instantly, and browse thousands 
              of curated book bundles or handmade paper crafts. Join our sustainable 
              reading revolution.
            </p>
            <div className="hero-enter hero-enter--delay-4 hero-buttons" style={styles.heroButtons}>
              <button
                type="button"
                className="hero-btn-primary"
                onClick={() => openAuthModal('login', '/donate')}
                style={{ ...styles.btn, backgroundColor: '#ffffff', color: '#1E4D4B', border: 'none', boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-hand-holding-heart"></i> Start Donating
              </button>
              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => openAuthModal('login', '/marketplace')}
                style={{ ...styles.btn, backgroundColor: 'transparent', color: '#ffffff', border: '2px solid rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, borderRadius: 12 }}
              >
                <i className="fa-solid fa-store"></i> Explore Marketplace
              </button>
            </div>
            <div className="hero-enter hero-enter--delay-5 hero-trust" style={styles.heroTrust}>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> Free to join</span>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> 12,450+ books donated</span>
              <span className="hero-trust-badge" style={styles.heroTrustBadge}><i className="fa-solid fa-circle-check" style={{ color: '#2A9D8F' }}></i> Instant points</span>
            </div>
          </div>
          <div className="hero-visual-enter hero-visual" style={styles.heroVisual}>
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
      <section id="how-it-works" className="how-it-works" style={styles.howItWorks}>
        <h2 className="reveal section-title" style={styles.sectionTitle}>How ShareShelf Works</h2>
        <p className="reveal section-subtitle" style={styles.sectionSubtitle}>Four simple steps to turn your books into new adventures.</p>
        <div className="reveal-stagger steps-grid" style={styles.stepsGrid}>
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
      <section className="stats-bar" style={styles.statsBar}>
        <div ref={statsRef} className="reveal-stagger stats-grid" style={styles.statsGrid}>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>📦 {formatNumber(animatedBooks)}+</span>
            <span style={styles.statLabel}>Books Donated</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>👥 {formatNumber(animatedMembers)}+</span>
            <span style={styles.statLabel}>Active Members</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className="stat-glow" style={styles.statNumber}>🪙 {formatNumber(animatedPoints)}+</span>
            <span style={styles.statLabel}>Points Earned</span>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section id="marketplace" className="categories" style={styles.categories}>
        <div className="categories-header" style={styles.categoriesHeader}>
          <h2 className="reveal section-title" style={styles.sectionTitle}>Find Your Genre</h2>
          <p className="reveal section-subtitle" style={styles.sectionSubtitle}>Browse thousands of books across every category imaginable.</p>
        </div>
        <div className="reveal-stagger category-grid" style={styles.categoryGrid}>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Fiction')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(231,111,81,0.15)', color: '#E76F51' }}><i className="fa-solid fa-dragon"></i></div>
            <div><h4>Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Novels, Fantasy & more</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Non-Fiction')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(42,157,143,0.15)', color: '#2A9D8F' }}><i className="fa-solid fa-globe"></i></div>
            <div><h4>Non-Fiction</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Biographies, History & Essays</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Academic')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(30,77,75,0.12)', color: '#1E4D4B' }}><i className="fa-solid fa-graduation-cap"></i></div>
            <div><h4>Academic</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Textbooks & Reference</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Childrens')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(233,196,106,0.2)', color: '#C4941A' }}><i className="fa-solid fa-crayon"></i></div>
            <div><h4>Children's</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Picture books & YA</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Comics')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(244,162,97,0.2)', color: '#F4A261' }}><i className="fa-solid fa-mask"></i></div>
            <div><h4>Comics</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Manga & Graphic Novels</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
          <div className="card-hover-lift" style={styles.categoryCard} onClick={() => handleProtectedAction('/marketplace?category=Rare Finds')}>
            <div style={{ ...styles.categoryIcon, background: 'rgba(230,57,70,0.1)', color: '#E63946' }}><i className="fa-solid fa-gem"></i></div>
            <div><h4>Rare Finds</h4><span style={{ fontSize: 13, color: '#6C757D' }}>Collectibles & Special Editions</span></div>
            <i className="fa-solid fa-arrow-right category-arrow"></i>
          </div>
        </div>
      </section>

      {/* ============ LEADERBOARD ============ */}
      <section className="leaderboard-section" style={styles.leaderboard} aria-labelledby="leaderboard-heading">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 id="leaderboard-heading" className="reveal section-title" style={styles.sectionTitle}>Top Book Donors</h2>
          <p className="reveal section-subtitle" style={styles.sectionSubtitle}>
            The readers giving the most books back to the community.
          </p>
        </div>

        {boardLoading ? (
          <div className="leaderboard-podium" style={styles.podium} aria-hidden="true">
            {[2, 1, 3].map((n) => (
              <div key={n} style={{ ...styles.podiumCard, ...styles.boardSkeleton, height: n === 1 ? 300 : 268 }} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={styles.emptyBoard}>
            No donations yet — be the first to get on the board!
          </div>
        ) : (
        <>
        <ol className="leaderboard-podium" style={styles.podium}>
          {leaderboard.slice(0, 3).map((donor) => {
            const isWinner = donor.rank === 1;
            const medal = MEDALS[donor.rank];
            return (
              <li
                key={donor.id}
                className="card-hover-lift"
                style={{
                  ...styles.podiumCard,
                  order: PODIUM_ORDER[donor.rank],
                  borderTop: `4px solid ${medal.color}`,
                  ...(isWinner
                    ? {
                        padding: '44px 24px 40px',
                        marginBottom: 12,
                        boxShadow: `0 16px 45px ${medal.glow}`,
                        border: `1px solid ${medal.color}`,
                      }
                    : {}),
                }}
              >
                <div style={{ ...styles.podiumMedal, background: medal.gradient }} aria-hidden="true">
                  {donor.rank}
                </div>
                <Avatar donor={donor} style={styles.podiumAvatar} />
                <h4 style={styles.donorName}>{donor.name}</h4>
                <span style={styles.donorTier}>
                  <i className="fa-solid fa-award" style={{ color: medal.color, marginRight: 6 }} aria-hidden="true"></i>
                  {donor.levelName}
                </span>
                <div style={styles.donorBooks}>{formatNumber(donor.booksDonated)}</div>
                <div style={styles.donorBooksLabel}>Books Donated</div>
                <div style={styles.donorPoints}>{formatNumber(donor.points)} points earned</div>
              </li>
            );
          })}
        </ol>

        {leaderboard.length > 3 && (
        <ol start={4} style={styles.rankList}>
          {leaderboard.slice(3).map((donor) => (
            <li key={donor.id} className="leaderboard-row" style={styles.rankRow}>
              <span style={styles.rankNum} aria-hidden="true">{donor.rank}</span>
              <Avatar donor={donor} style={styles.rankAvatar} />
              <div>
                <h4 style={styles.donorName}>{donor.name}</h4>
                <span style={styles.donorTier}>{donor.levelName}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={styles.rankBooks}>{formatNumber(donor.booksDonated)}</div>
                <div style={styles.donorBooksLabel}>books</div>
              </div>
            </li>
          ))}
        </ol>
        )}
        </>
        )}
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testimonials" style={styles.testimonials}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="reveal section-title" style={styles.sectionTitle}>What Our Readers Say</h2>
          <p className="reveal section-subtitle" style={styles.sectionSubtitle}>Join thousands of happy book lovers and crafters.</p>
        </div>
        <div className="reveal-stagger testimonial-grid" style={styles.testimonialGrid}>
          {topReviews.length > 0 ? topReviews.map((review, idx) => (
            <div key={review.id || idx} className="card-hover-lift" style={styles.testimonialCard}>
              <div style={styles.testimonialStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fa-star ${i < review.rating ? 'fa-solid' : 'fa-regular'}`} style={{ color: '#E9C46A' }}></i>
                ))}
              </div>
              <p style={styles.testimonialText}>"{review.comment || 'Great experience!'}"</p>
              <div style={styles.testimonialAuthor}>
                {review.user?.profileImage ? (
                  <img 
                    src={review.user.profileImage} 
                    alt="Profile" 
                    style={styles.testimonialAvatar} 
                  />
                ) : (
                  <div style={{...styles.testimonialAvatar, background: `hsl(${idx * 40}, 70%, 50%)`}}>
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 style={styles.authorName}>{review.user?.name || 'Anonymous User'}</h4>
                  <span style={styles.authorRole}>ShareShelf Member</span>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', width: '100%', color: '#6C757D' }}>
              No reviews yet. Be the first to leave one!
            </div>
          )}
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-pulse cta-banner" style={styles.ctaBanner}>
        <h2 className="reveal" style={{ color: 'white', fontSize: 36, marginBottom: 16, position: 'relative', zIndex: 1 }}>Ready to Give Your Books a New Story?</h2>
        <p className="reveal" style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 24, position: 'relative', zIndex: 1 }}>Join thousands of readers and crafters building a library without walls.</p>
        <button type="button" onClick={() => openAuthModal('signup', '/user-dashboard')} className="reveal" style={{ ...styles.btn, background: 'white', color: '#E76F51', borderColor: 'white', fontSize: 18, padding: '16px 36px', position: 'relative', zIndex: 1 }}>
          <i className="fa-solid fa-gift"></i> Sign Up Free — Earn 50 Bonus Points
        </button>
        <p className="reveal" style={{ ...styles.ctaNote, position: 'relative', zIndex: 1 }}>No credit card. Just books and good vibes.</p>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="about" className="footer" style={styles.footer}>
        <div className="footer-grid" style={styles.footerGrid}>
          <div>
            <div style={styles.footerLogo}>📚 ShareShelf</div>
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
            <h4 style={{ color: 'white', fontSize: 18, marginBottom: 16 }}>Contact</h4>
            <ul style={styles.footerLinks}>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-envelope"></i> hello@shareshelf.com</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-phone"></i> +94 77 123 4567</li>
              <li style={{ marginBottom: 8 }}><i className="fa-solid fa-location-dot"></i> Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={styles.footerBottom}>
          <p>&copy; 2025 ShareShelf. Built with ❤️ for book lovers everywhere.</p>
        </div>
      </footer>

      {/* Login / Signup popup modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        redirectTo={authRedirect}
      />

    </div>
  );
};

export default Home;
