import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/delivery.css';

const DeliveryPersonPage = () => {
  const isOnline = true;
  const [activeNav, setActiveNav] = useState('deliveries');
  const [headerHidden, setHeaderHidden] = useState(false);
  const navigate = useNavigate();

  const lastScrollY = useRef(0);
  const leftCardRef = useRef(null);
  const queueRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      if (currentY <= 0) {
        setHeaderHidden(false);
        lastScrollY.current = 0;
        return;
      }

      if (currentY > lastScrollY.current && currentY > 60) {
        // scrolling down
        setHeaderHidden(true);
      } else if (currentY < lastScrollY.current) {
        // scrolling up
        setHeaderHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncHeights = () => {
      try {
        if (leftCardRef.current && queueRef.current) {
          const h = leftCardRef.current.offsetHeight;
          queueRef.current.style.minHeight = `${h}px`;
        }
      } catch (e) {
        console.warn('syncHeights failed', e);
      }
    };
    syncHeights();
    window.addEventListener('resize', syncHeights);
    return () => window.removeEventListener('resize', syncHeights);
  }, []);

  const handleConfirmDelivery = () => alert('Delivery confirmed!');
  const handleContactCustomer = () => alert('Contacting customer...');
  const handleMapControl = (action) => console.log(`Map: ${action}`);

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <header className={`header ${headerHidden ? 'header--hidden' : ''}`}>
        <div className="header-left">
          <h1 className="font-headline-md" style={{ color: '#002627', margin: 0 }}>ShareShelf</h1>
        </div>
        <div className="header-center">
          <div className="page-title-small">Delivery Details</div>
        </div>
        <div className="header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: isOnline ? '#beebeb' : '#e1e3e4' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#002627' : '#717978', animation: isOnline ? 'pulse 1s infinite' : 'none' }}></span>
            <span className="font-label-md" style={{ color: '#0f3d3e' }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
        {/* Desktop Sidebar */}
          <aside className="sidebar">
          <div style={{ marginBottom: '12px' }}>
            <div className="sidebar-profile">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0x8sQLCGB6Op_mJHKL_oT_eqFyk482wA5k08BlgvcvKxG-Stbdk2pw8FNjZ-D6ohl3SP7w1K37VAmvdFDU029pZlig1_R2VrIkdUZ0-50cU_B2WU79nyQMd1CZDwsDhvmh94f060FoQotQCW1ofp2MSj5-Gdi37sqvRYCGqlLotXCyqTswaKqliyIY28DGW6hYBbV2smxGrvOo3YlFk6rIZ2CnYgF_3yt5FzLxlHaffkh8kFHdaehDOpocjDjGB9I9CpSeWsETBU" alt="Driver" />
              <div className="profile-info">
                <p className="profile-name">ShareShelf Logistics</p>
                <p className="profile-role">Eco-Friendly Delivery</p>
              </div>
            </div>

            <div className="driver-badge">
              <div className="driver-meta">
                <div className="id-label">Driver ID: 8821</div>
                <div className="id-status">Active Session</div>
                <button className="view-map-btn" onClick={() => navigate('/delivery/DeliveryPersonPage')}>View Map</button>
              </div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => { setActiveNav('deliveries'); navigate('/delivery/DeliveryPersonPage'); }} className={`sidebar-nav-btn ${activeNav === 'deliveries' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">local_shipping</span>
              <span className="font-label-md">Active Deliveries</span>
            </button>
            <button onClick={() => { setActiveNav('history'); navigate('/order-history'); }} className={`sidebar-nav-btn ${activeNav === 'history' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">history</span>
              <span className="font-label-md">Order History</span>
            </button>
            <button onClick={() => navigate('/')} className="sidebar-nav-btn sidebar-logout" style={{ marginTop: '4px' }}>
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-container">
            {/* main page title removed — using centered navbar title */}

            <div className="delivery-grid">
              {/* Current Task */}
              <section className="current-task">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className="font-headline-lg section-title" style={{ color: '#002627' }}>Current Task</h2>
                  <button style={{ color: '#002627', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
                    <span className="font-label-md">Need help?</span>
                  </button>
                </div>
                <div ref={leftCardRef} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  {/* Map */}
                  <div className="map-container">
                    <img className="map-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzBuqdVMr68u9rhvoCMRzxdDadcGKE0jdpZz8Hew1MBbrWAvHKW59g6WN9m-Snb51ogd7KOMXELb6wFYOCYJ138dcHfp5cXdRvdxeaxqLf9UvzKDnNoExEnsdrcdp3cEeA1TagpnS74GHTCpejgI28s3f4R1PNhSYhO63IYOvCl2qgfQOKydfjtGav7Lz2sBkkA0E2Jn2mUDDAz0FP9-FF9EvU-KHfngnFBjW5uexISRTIa-gSYP7wb8fZPFyO6XjoN22IT0Ktrk" alt="Route" />
                    <div className="map-gradient-overlay"></div>
                    <div className="map-controls">
                      <button onClick={() => handleMapControl('location')} className="map-control-btn"><span className="material-symbols-outlined" style={{ color: '#002627' }}>my_location</span></button>
                      <button onClick={() => handleMapControl('zoom in')} className="map-control-btn"><span className="material-symbols-outlined" style={{ color: '#002627' }}>add</span></button>
                      <button onClick={() => handleMapControl('zoom out')} className="map-control-btn"><span className="material-symbols-outlined" style={{ color: '#002627' }}>remove</span></button>
                    </div>
                    <div className="map-nav-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#0f3d3e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: 'white', fontVariationSettings: "'FILL' 1" }}>navigation</span>
                        </div>
                        <div>
                          <p className="font-label-md" style={{ color: '#191c1d' }}>Next turn in 400m</p>
                          <p className="font-label-sm" style={{ color: '#404848' }}>Turn right onto Bloomsbury Way</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-headline-md" style={{ color: '#002627' }}>8 min</p>
                        <p className="font-label-sm" style={{ color: '#404848' }}>1.2 km left</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                    <div className="order-details">
                    <div className="order-header">
                      <div>
                        <span className="font-label-sm" style={{ color: '#404848', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Order #SS-8291</span>
                        <h3 className="font-headline-md" style={{ color: '#002627', marginTop: '4px' }}>Gourmet Book Set &amp; Stationery</h3>
                      </div>
                      <div>
                        <span className="priority-badge">Priority Express</span>
                      </div>
                    </div>
                    <div className="order-grid">
                      <div className="order-info">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#404848' }}>storefront</span>
                            <div>
                              <p className="font-label-sm" style={{ color: '#404848', textTransform: 'uppercase', fontWeight: 'bold' }}>Pick-up From</p>
                              <p className="font-body-md">ShareShelf Flagship Store</p>
                              <p className="font-label-md" style={{ color: '#404848' }}>24 Literary Grove, Bloomsbury</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#002627', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                            <div>
                              <p className="font-label-sm" style={{ color: '#404848', textTransform: 'uppercase', fontWeight: 'bold' }}>Delivery To</p>
                              <p className="font-body-md">Eleanor Rigby</p>
                              <p className="font-label-md" style={{ color: '#404848' }}>82 Abbey Road, Apt 4B</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="notes-box">
                        <p className="font-label-sm" style={{ color: '#404848', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Delivery Notes</p>
                        <p className="font-label-md" style={{ fontStyle: 'italic', color: '#191c1d' }}>&quot;Please leave at the concierge desk. Fragile items inside. Call upon arrival.&quot;</p>
                      </div>
                    </div>
                    <div className="button-row">
                      <button onClick={handleConfirmDelivery} className="btn-primary">Confirm Delivery</button>
                      <button onClick={handleContactCustomer} className="btn-outline contact-btn"><span className="material-symbols-outlined">call</span> Contact Customer</button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Queue Section */}
              <section ref={queueRef} className="queue-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className="font-headline-lg section-title" style={{ color: '#002627' }}>Queue</h2>
                  <span style={{ backgroundColor: '#beebeb', color: '#002627', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>3 Pending</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Item 1 */}
                  <div className="glass-card queue-item" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #556160', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div><span style={{ fontSize: '10px', color: '#404848', fontWeight: 'bold' }}>ORDER #SS-8294</span><h4 style={{ fontSize: '18px', fontWeight: '600', color: '#002627', marginTop: '4px' }}>Vintage Classics Bundle</h4></div>
                      <span className="font-label-sm" style={{ fontWeight: 'bold', color: '#404848' }}>14:30 EST</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: '#404848', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>near_me</span><span className="font-label-md">2.4 km</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span><span className="font-label-md">15 min</span></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="font-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#404848' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>package</span>3 Items • 1.2 kg</p>
                      <span className="material-symbols-outlined" style={{ color: '#002627', fontSize: '16px', transition: 'transform 0.2s' }}>arrow_forward_ios</span>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="glass-card queue-item" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #c0c8c8', opacity: 0.8, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div><span style={{ fontSize: '10px', color: '#404848', fontWeight: 'bold' }}>ORDER #SS-8299</span><h4 style={{ fontSize: '18px', fontWeight: '600', color: '#002627', marginTop: '4px' }}>Eco-Wrap Gift Set</h4></div>
                      <span className="font-label-sm" style={{ fontWeight: 'bold', color: '#404848' }}>15:15 EST</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: '#404848', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>near_me</span><span className="font-label-md">4.1 km</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span><span className="font-label-md">22 min</span></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="font-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#404848' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>package</span>1 Item • 0.5 kg</p>
                      <span className="material-symbols-outlined" style={{ color: '#002627', fontSize: '16px' }}>arrow_forward_ios</span>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="glass-card queue-item" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #c0c8c8', opacity: 0.8, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div><span style={{ fontSize: '10px', color: '#404848', fontWeight: 'bold' }}>ORDER #SS-8302</span><h4 style={{ fontSize: '18px', fontWeight: '600', color: '#002627', marginTop: '4px' }}>Coffee Table Collection</h4></div>
                      <span className="font-label-sm" style={{ fontWeight: 'bold', color: '#404848' }}>16:00 EST</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: '#404848', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>near_me</span><span className="font-label-md">6.8 km</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span><span className="font-label-md">35 min</span></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="font-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#404848' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>package</span>5 Items • 4.8 kg</p>
                      <span className="material-symbols-outlined" style={{ color: '#002627', fontSize: '16px' }}>arrow_forward_ios</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button className="flex flex-col items-center gap-1" style={{ color: '#002627', background: 'none', border: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Deliveries</span>
        </button>
        <button className="flex flex-col items-center gap-1" style={{ color: '#404848', background: 'none', border: 'none' }}>
          <span className="material-symbols-outlined">map</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Map</span>
        </button>
        <button className="flex flex-col items-center gap-1" style={{ color: '#404848', background: 'none', border: 'none' }}>
          <span className="material-symbols-outlined">insights</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Earnings</span>
        </button>
        <button className="flex flex-col items-center gap-1" style={{ color: '#404848', background: 'none', border: 'none' }}>
          <span className="material-symbols-outlined">person</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Profile</span>
        </button>
      </div>

      {/* FAB removed per request (offline toggle replaced by logout) */}

      <style>{`
        @media (max-width: 768px) {
          .fab-mobile { display: flex !important; }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DeliveryPersonPage;