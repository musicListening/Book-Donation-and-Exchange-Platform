// client/src/pages/home.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminConsole, setShowAdminConsole] = useState(false);

  // Stats / Demo Data States
  const [users, setUsers] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [donations, setDonations] = useState([
    { id: "#TXN-84920", donor: "Sarah Jenkins", quantity: "12 Books", status: "Verified", points: "+240 pts", date: "Jun 12, 2026" },
    { id: "#TXN-84919", donor: "Marcus Thorne", quantity: "4 Books", status: "Pending", points: "+80 pts", date: "Jun 12, 2026" },
    { id: "#TXN-84918", donor: "Elena Rodriguez", quantity: "28 Books", status: "Verified", points: "+560 pts", date: "Jun 11, 2026" },
    { id: "#TXN-84917", donor: "David Kim", quantity: "15 Books", status: "Verified", points: "+300 pts", date: "Jun 10, 2026" },
  ]);

  // Load from localStorage or initialize
  useEffect(() => {
    let storedUsers = localStorage.getItem("ss_users");
    let storedBundles = localStorage.getItem("ss_bundles");
    let storedCrafts = localStorage.getItem("ss_crafts");

    if (!storedUsers) {
      const initialUsers = [
        { name: 'Arjun Sharma', email: 'user@example.com', password: 'user123', role: 'user', points: 450 },
        { name: 'Staff Member', email: 'staff@projenius.com', password: 'staff123', role: 'staff', points: 0 },
        { name: 'Admin User', email: 'admin@projenius.com', password: 'admin123', role: 'admin', points: 0 }
      ];
      localStorage.setItem('ss_users', JSON.stringify(initialUsers));
      storedUsers = JSON.stringify(initialUsers);
    }

    if (!storedBundles) {
      const initialBundles = [
        { id: 1, title: 'Timeless Literature', curator: 'Staff Pick', genre: 'Fiction', price: 250, stock: 12, image: '📚' },
        { id: 2, title: 'Science for Kids', curator: 'Educator Choice', genre: 'Academic', price: 180, stock: 8, image: '🧪' },
        { id: 3, title: 'The Mystery Files', curator: 'Detective Club', genre: 'Mystery', price: 320, stock: 5, image: '🕵️' }
      ];
      localStorage.setItem('ss_bundles', JSON.stringify(initialBundles));
      storedBundles = JSON.stringify(initialBundles);
    }

    if (!storedCrafts) {
      const initialCrafts = [
        { id: 1, title: 'Origami Crane Set', curator: 'Akira', genre: 'Crafts', price: 75, stock: 15, image: '🦢' },
        { id: 2, title: 'Recycled Notebook', curator: 'Eco-Art', genre: 'Crafts', price: 120, stock: 10, image: '📔' }
      ];
      localStorage.setItem('ss_crafts', JSON.stringify(initialCrafts));
      storedCrafts = JSON.stringify(initialCrafts);
    }

    setUsers(JSON.parse(storedUsers));
    setBundles(JSON.parse(storedBundles));
    setCrafts(JSON.parse(storedCrafts));
  }, []);

  // Admin Actions
  const handleVerifyDonation = (id) => {
    setDonations(prev =>
      prev.map(d => d.id === id ? { ...d, status: "Verified" } : d)
    );
  };

  const handleAddDonation = () => {
    const randomQty = Math.floor(Math.random() * 20) + 1;
    const newTxn = {
      id: `#TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      donor: "Anonymous Book Lover",
      quantity: `${randomQty} Books`,
      status: "Pending",
      points: `+${randomQty * 20} pts`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setDonations([newTxn, ...donations]);
  };

  return (
    <div className="homepage-container">
      {/* ============ HEADER ============ */}
      <header className="header">
        <nav className="navbar">
          <Link to="/" className="logo">
            <i className="fa-solid fa-book-open"></i> ShareShelf
          </Link>
          <ul className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a></li>
            <li><a href="#marketplace" onClick={() => setMobileMenuOpen(false)}>Marketplace</a></li>
            <li>
              <Link 
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-sm btn-secondary"
                style={{ border: '1px dashed var(--primary)', fontWeight: 'bold' }}
              >
                ⚙️ Admin Console
              </Link>
            </li>
          </ul>
          <div className="nav-actions">
            <span className="points-badge">
              <i className="fa-solid fa-coins"></i> Points System
            </span>
            <Link to="/register" className="btn btn-secondary btn-sm">Sign Up</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Log In</Link>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              ☰
            </button>
          </div>
        </nav>
      </header>

      {/* ============ ADMIN CONSOLE INLINE PANEL ============ */}
      {showAdminConsole && (
        <section className="admin-console-panel" style={{ marginTop: '100px' }}>
          <div className="admin-console-header">
            <h2><i className="fa-solid fa-sliders"></i> Integrated Admin Console</h2>
            <button className="admin-console-close-btn" onClick={() => setShowAdminConsole(false)}>×</button>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <p className="admin-stat-label">Registered Users</p>
              <h3 className="admin-stat-value">{users.length}</h3>
              <span className="admin-stat-sub"><i className="fa-solid fa-circle-user"></i> Active Members</span>
            </div>
            <div className="admin-stat-card" style={{ borderColor: 'var(--accent)' }}>
              <p className="admin-stat-label">Book Bundles</p>
              <h3 className="admin-stat-value">{bundles.length}</h3>
              <span className="admin-stat-sub" style={{ color: 'var(--accent)' }}><i className="fa-solid fa-box-archive"></i> Staff Curated</span>
            </div>
            <div className="admin-stat-card" style={{ borderColor: 'var(--success)' }}>
              <p className="admin-stat-label">Handmade Crafts</p>
              <h3 className="admin-stat-value">{crafts.length}</h3>
              <span className="admin-stat-sub" style={{ color: 'var(--success)' }}><i className="fa-solid fa-palette"></i> P2P Created</span>
            </div>
            <div className="admin-stat-card" style={{ borderColor: 'var(--warning)' }}>
              <p className="admin-stat-label">Pending Donations</p>
              <h3 className="admin-stat-value">{donations.filter(d => d.status === "Pending").length}</h3>
              <span className="admin-stat-sub" style={{ color: 'var(--warning)' }}><i className="fa-solid fa-clock"></i> Requires Approval</span>
            </div>
          </div>

          <div className="admin-actions-section">
            <div className="admin-table-container">
              <h3>
                Recent Donations Activity
                <button className="btn btn-secondary btn-sm" onClick={handleAddDonation}>
                  + Simulate Donation
                </button>
              </h3>
              <table className="admin-mini-table">
                <thead>
                  <tr>
                    <th>TXN ID</th>
                    <th>Donor Name</th>
                    <th>Books</th>
                    <th>Reward Points</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.id}</td>
                      <td>{row.donor}</td>
                      <td>{row.quantity}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{row.points}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        {row.status === "Pending" ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleVerifyDonation(row.id)}
                          >
                            Approve
                          </button>
                        ) : (
                          <span style={{ color: 'var(--grey)', fontSize: '12px' }}><i className="fa-solid fa-circle-check"></i> Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-controls-card">
              <h3>Admin Actions</h3>
              <div className="admin-action-btn-list">
                <Link to="/admin"><i className="fa-solid fa-gauge"></i> Full Admin Dashboard</Link>
                <Link to="/admin/users"><i className="fa-solid fa-users-gear"></i> Manage Users List</Link>
                <button onClick={() => alert("CSV Export Triggered!")}>
                  <i className="fa-solid fa-file-arrow-down"></i> Export Report (CSV)
                </button>
                <button onClick={() => alert("Demo data reset complete!")}>
                  <i className="fa-solid fa-rotate-left"></i> Reset System Cache
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ HERO SECTION ============ */}
      <section className="hero" style={{ paddingTop: showAdminConsole ? '40px' : '120px' }}>
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-book"></i> Projenius Book Exchange
          </div>
          <h1 className="hero-title">
            Turn Your Shelves Into Points.<br /><span>Turn Points Into Treasures.</span>
          </h1>
          <p className="hero-description">
            Donate any genre of books, earn points instantly, and browse thousands 
            of curated book bundles or handmade paper crafts. Join our sustainable 
            reading revolution.
          </p>
          <div className="hero-buttons">
            <Link to="/donate" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-hand-holding-heart"></i> Start Donating
            </Link>
            <a href="#marketplace" className="btn btn-gold btn-lg">
              <i className="fa-solid fa-store"></i> Explore Marketplace
            </a>
          </div>
          <div className="hero-trust">
            <span><i className="fa-solid fa-circle-check"></i> Free to join</span>
            <span><i className="fa-solid fa-circle-check"></i> 12,450+ books donated</span>
            <span><i className="fa-solid fa-circle-check"></i> Instant points</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="blob-bg"></div>
            <div className="book-stack">
              <div className="book"><i className="fa-solid fa-book" style={{ marginRight: '8px' }}></i> Fiction</div>
              <div className="book"><i className="fa-solid fa-graduation-cap" style={{ marginRight: '8px' }}></i> Academic</div>
              <div className="book"><i className="fa-solid fa-child" style={{ marginRight: '8px' }}></i> Children's</div>
              <div className="book"><i className="fa-solid fa-mask" style={{ marginRight: '8px' }}></i> Comics</div>
              <div className="book"><i className="fa-solid fa-gem" style={{ marginRight: '8px' }}></i> Rare Finds</div>
            </div>
            <div className="floating-points">
              <i className="fa-solid fa-coins"></i> +50 pts
            </div>
            <div className="floating-craft">
              🎨 Handmade Crafts
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How Projenius Works</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>Four simple steps to turn your books into new adventures.</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-calendar-plus"></i>
              <span className="step-number">1</span>
            </div>
            <h3>Schedule Donation</h3>
            <p>Tell us what books you want to give and pick a drop-off date that works for you.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-coins"></i>
              <span className="step-number">2</span>
            </div>
            <h3>Get Points</h3>
            <p>Staff verifies your books and credits points to your account instantly.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-basket-shopping"></i>
              <span className="step-number">3</span>
            </div>
            <h3>Browse & Shop</h3>
            <p>Use points to grab curated book bundles or unique paper crafts.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-box"></i>
              <span className="step-number">4</span>
            </div>
            <h3>Receive & Enjoy</h3>
            <p>We deliver right to your doorstep. Happy reading and crafting!</p>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">📦 12,450+</span>
            <span className="stat-label">Books Donated</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">👥 3,800+</span>
            <span className="stat-label">Active Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">🪙 1.2M+</span>
            <span className="stat-label">Points Earned</span>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="categories" id="marketplace">
        <div className="categories-header">
          <h2 className="section-title">Find Your Genre</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>Browse thousands of books across every category imaginable.</p>
        </div>
        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon cat-fiction"><i className="fa-solid fa-dragon"></i></div>
            <div className="category-info">
              <h4>Fiction</h4>
              <span>Novels, Fantasy & more</span>
            </div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-nonfiction"><i className="fa-solid fa-globe"></i></div>
            <div className="category-info">
              <h4>Non-Fiction</h4>
              <span>Biographies, History & Essays</span>
            </div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-academic"><i className="fa-solid fa-graduation-cap"></i></div>
            <div className="category-info">
              <h4>Academic</h4>
              <span>Textbooks & Reference</span>
            </div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-children"><i className="fa-solid fa-crayon"></i></div>
            <div className="category-info">
              <h4>Children's</h4>
              <span>Picture books & YA</span>
            </div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-comics"><i className="fa-solid fa-mask"></i></div>
            <div className="category-info">
              <h4>Comics</h4>
              <span>Manga & Graphic Novels</span>
            </div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-rare"><i className="fa-solid fa-gem"></i></div>
            <div className="category-info">
              <h4>Rare Finds</h4>
              <span>Collectibles & Special Editions</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRENDING BUNDLES ============ */}
      <section className="trending">
        <div className="trending-header">
          <div>
            <h2 className="section-title">🔥 Staff-Curated Bundles</h2>
            <p className="section-subtitle">Handpicked collections by our expert staff.</p>
          </div>
          <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View All <i className="fa-solid fa-arrow-right"></i></a>
        </div>
        <div className="bundles-scroll">
          {bundles.map((bundle) => (
            <div className="bundle-card" key={bundle.id}>
              <div className="bundle-image">
                {bundle.image}
                <span className="bundle-genre-badge">{bundle.genre}</span>
                {bundle.stock && <span className="bundle-stock">Only {bundle.stock} left</span>}
              </div>
              <div className="bundle-details">
                <h4>{bundle.title}</h4>
                <p className="bundle-curator">Curated by: {bundle.curator}</p>
                <div className="bundle-price-row">
                  <span className="bundle-price"><i className="fa-solid fa-coins"></i> {bundle.price}</span>
                  <a href="#" className="btn btn-primary btn-sm" onClick={(e) => e.preventDefault()}>Add to Cart</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HANDMADE CRAFTS ============ */}
      <section className="crafts">
        <div style={{ textAlign: "center", marginBottom: "var(--space-sm)" }}>
          <h2 className="section-title">🎨 Handmade Paper Creations</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>Unique crafts made by talented community members.</p>
        </div>
        <div className="crafts-grid">
          {crafts.map((craft) => (
            <div className="craft-card" key={craft.id}>
              <div className="craft-image">{craft.image}</div>
              <div className="craft-details">
                <p className="craft-seller">by {craft.curator}</p>
                <h4>{craft.title}</h4>
                <div className="craft-price-row">
                  <span className="bundle-price"><i className="fa-solid fa-coins"></i> {craft.price}</span>
                  <button className="wishlist-btn"><i className="fa-regular fa-heart"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testimonials">
        <div className="testimonials-header">
          <h2 className="section-title">What Our Readers Say</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>Join thousands of happy book lovers and crafters.</p>
        </div>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="testimonial-avatar">👩</div>
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">"I decluttered my shelf and got enough points to buy a rare poetry bundle. This is genius!"</p>
            <p className="testimonial-name">Ananya S.</p>
            <p className="testimonial-role">Donated 45 books</p>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-avatar">👨</div>
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">"Selling my paper crafts here connected me with readers who truly appreciate handmade art."</p>
            <p className="testimonial-name">Vikram R.</p>
            <p className="testimonial-role">Craft Seller</p>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-avatar">👩‍🎓</div>
            <div className="stars">★★★★★</div>
            <p className="testimonial-quote">"As a student, being able to exchange textbooks for points is a lifesaver. Highly recommend!"</p>
            <p className="testimonial-name">Fatima K.</p>
            <p className="testimonial-role">Student</p>
          </div>
        </div>
      </section>

      {/* ============ LEVELS ============ */}
      <section className="levels">
        <h2 className="section-title">Level Up Your Reading</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>Earn more benefits as you donate and engage.</p>
        <div className="levels-grid">
          <div className="level-card">
            <div className="level-badge badge-silver">📚</div>
            <h3>Book Lover</h3>
            <p className="level-points">0 — 250 Points</p>
            <ul className="level-benefits">
              <li><i className="fa-solid fa-check"></i> Early bundle access</li>
              <li><i className="fa-solid fa-check"></i> Profile badge</li>
              <li><i className="fa-solid fa-check"></i> Standard delivery</li>
            </ul>
          </div>
          <div className="level-card featured">
            <div className="level-badge badge-gold">🥇</div>
            <h3>Bibliophile</h3>
            <p className="level-points">251 — 750 Points</p>
            <ul className="level-benefits">
              <li><i className="fa-solid fa-check"></i> +10% bonus points on donations</li>
              <li><i className="fa-solid fa-check"></i> Priority support</li>
              <li><i className="fa-solid fa-check"></i> Exclusive bundles</li>
              <li><i className="fa-solid fa-check"></i> Free shipping on orders over 200 pts</li>
            </ul>
          </div>
          <div className="level-card">
            <div className="level-badge badge-diamond">💎</div>
            <h3>Grand Librarian</h3>
            <p className="level-points">751+ Points</p>
            <ul className="level-benefits">
              <li><i className="fa-solid fa-check"></i> +20% bonus points on donations</li>
              <li><i className="fa-solid fa-check"></i> Free delivery always</li>
              <li><i className="fa-solid fa-check"></i> Custom profile frame</li>
              <li><i className="fa-solid fa-check"></i> Early access to all new arrivals</li>
              <li><i className="fa-solid fa-check"></i> VIP support line</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: "var(--space-xl)", textAlign: "center" }}>
          <p style={{ color: "var(--grey)", marginBottom: "var(--space-xs)", fontSize: "14px" }}>
            📊 300 pts to Bibliophile
          </p>
          <div style={{ background: "var(--light-grey)", height: "8px", borderRadius: "4px", maxWidth: "300px", margin: "0 auto", overflow: "hidden" }}>
            <div style={{ background: "var(--secondary)", height: "100%", width: "40%", borderRadius: "4px" }}></div>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-banner">
        <h2>Ready to Give Your Books a New Story?</h2>
        <p>Join thousands of readers and crafters building a library without walls.</p>
        <Link to="/register" className="btn btn-lg">
          <i className="fa-solid fa-gift"></i> Sign Up Free — Earn 50 Bonus Points
        </Link>
        <p className="cta-note">No credit card. Just books and good vibes.</p>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">📚 Projenius</div>
            <p className="footer-about">
              Building a sustainable ecosystem to reduce book waste, promote literacy, 
              and create a circular economy for books through donations and point-based exchanges.
            </p>
            <div className="social-links">
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fa-brands fa-twitter"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/donate">Donate Books</Link></li>
              <li><a href="#marketplace">Marketplace</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4>Staff & Admin</h4>
            <ul className="footer-links">
              <li><Link to="/login">Staff Portal</Link></li>
              <li>
                <Link 
                  to="/admin"
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', font: 'inherit' }}
                >
                  Admin Console
                </Link>
              </li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="footer-links">
              <li><i className="fa-solid fa-envelope"></i> hello@projenius.com</li>
              <li><i className="fa-solid fa-phone"></i> +91 98765 43210</li>
              <li><i className="fa-solid fa-location-dot"></i> Bangalore, India</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Projenius. Built with ❤️ for book lovers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
