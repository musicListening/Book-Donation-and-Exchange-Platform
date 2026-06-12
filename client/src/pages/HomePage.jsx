import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Demo Data in LocalStorage
  useEffect(() => {
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
    console.log('📚 Projenius Homepage Loaded Successfully!');
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <nav className="navbar">
          <Link to="/" className="logo">
            <i className="fa-solid fa-book-open"></i> ShareShelf
          </Link>
          <ul className={`nav-links ${isMenuOpen ? 'show' : ''}`}>
            <li><Link to="/">Home</Link></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><a href="#about">About</a></li>
          </ul>
          <div className="nav-actions">
            <span className="points-badge">
              <i className="fa-solid fa-coins"></i> Points System
            </span>
            <Link to="/register" className="btn btn-secondary btn-sm">Sign Up</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Log In</Link>
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
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
            <Link to="/marketplace" className="btn btn-gold btn-lg">
              <i className="fa-solid fa-store"></i> Explore Marketplace
            </Link>
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
              <div className="book"><i className="fa-solid fa-book" style={{marginRight: '8px'}}></i> Fiction</div>
              <div className="book"><i className="fa-solid fa-graduation-cap" style={{marginRight: '8px'}}></i> Academic</div>
              <div className="book"><i className="fa-solid fa-child" style={{marginRight: '8px'}}></i> Children's</div>
              <div className="book"><i className="fa-solid fa-mask" style={{marginRight: '8px'}}></i> Comics</div>
              <div className="book"><i className="fa-solid fa-gem" style={{marginRight: '8px'}}></i> Rare Finds</div>
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

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How Projenius Works</h2>
        <p className="section-subtitle" style={{margin: '0 auto'}}>Four simple steps to turn your books into new adventures.</p>
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

      {/* STATS BAR */}
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

      {/* CATEGORIES */}
      <section className="categories" id="marketplace">
        <div className="categories-header">
          <h2 className="section-title">Find Your Genre</h2>
          <p className="section-subtitle" style={{margin: '0 auto'}}>Browse thousands of books across every category imaginable.</p>
        </div>
        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon cat-fiction"><i className="fa-solid fa-dragon"></i></div>
            <div className="category-info"><h4>Fiction</h4><span>Novels, Fantasy & more</span></div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-nonfiction"><i className="fa-solid fa-globe"></i></div>
            <div className="category-info"><h4>Non-Fiction</h4><span>Biographies, History & Essays</span></div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-academic"><i className="fa-solid fa-graduation-cap"></i></div>
            <div className="category-info"><h4>Academic</h4><span>Textbooks & Reference</span></div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-children"><i className="fa-solid fa-crayon"></i></div>
            <div className="category-info"><h4>Children's</h4><span>Picture books & YA</span></div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-comics"><i className="fa-solid fa-mask"></i></div>
            <div className="category-info"><h4>Comics</h4><span>Manga & Graphic Novels</span></div>
          </div>
          <div className="category-card">
            <div className="category-icon cat-rare"><i className="fa-solid fa-gem"></i></div>
            <div className="category-info"><h4>Rare Finds</h4><span>Collectibles & Special Editions</span></div>
          </div>
        </div>
      </section>

      {/* TRENDING BUNDLES */}
      <section className="trending">
        <div className="trending-header">
          <div>
            <h2 className="section-title">🔥 Staff-Curated Bundles</h2>
            <p className="section-subtitle">Handpicked collections by our expert staff.</p>
          </div>
          <Link to="/marketplace" className="view-all">View All <i className="fa-solid fa-arrow-right"></i></Link>
        </div>
        <div className="bundles-scroll">
          <div className="bundle-card">
            <div className="bundle-image">📚<span className="bundle-genre-badge">Romance</span><span className="bundle-stock">Only 3 left</span></div>
            <div className="bundle-details">
              <h4>Cozy Winter Reads</h4>
              <p className="bundle-curator">Curated by: Anika</p>
              <div className="bundle-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 250</span>
                <Link to="/marketplace" className="btn btn-primary btn-sm">Add to Cart</Link>
              </div>
            </div>
          </div>
          <div className="bundle-card">
            <div className="bundle-image" style={{background: 'linear-gradient(135deg, #E8F4F8, #D5E8E0)'}}>🖋️<span className="bundle-genre-badge">Self-Help</span></div>
            <div className="bundle-details">
              <h4>Mindfulness Collection</h4>
              <p className="bundle-curator">Curated by: Raj</p>
              <div className="bundle-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 180</span>
                <Link to="/marketplace" className="btn btn-primary btn-sm">Add to Cart</Link>
              </div>
            </div>
          </div>
          <div className="bundle-card">
            <div className="bundle-image" style={{background: 'linear-gradient(135deg, #FFF0E0, #FFE0D0)'}}>🔬<span className="bundle-genre-badge">Educational</span></div>
            <div className="bundle-details">
              <h4>Science Explorers Pack</h4>
              <p className="bundle-curator">Curated by: Priya</p>
              <div className="bundle-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 320</span>
                <Link to="/marketplace" className="btn btn-primary btn-sm">Add to Cart</Link>
              </div>
            </div>
          </div>
          <div className="bundle-card">
            <div className="bundle-image" style={{background: 'linear-gradient(135deg, #F0F0F8, #E0E0F0)'}}>🎭<span className="bundle-genre-badge">Classics</span></div>
            <div className="bundle-details">
              <h4>Timeless Literature</h4>
              <p className="bundle-curator">Curated by: David</p>
              <div className="bundle-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 400</span>
                <Link to="/marketplace" className="btn btn-primary btn-sm">Add to Cart</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HANDMADE CRAFTS */}
      <section className="crafts">
        <div style={{textAlign: 'center', marginBottom: 'var(--space-sm)'}}>
          <h2 className="section-title">🎨 Handmade Paper Creations</h2>
          <p className="section-subtitle" style={{margin: '0 auto'}}>Unique crafts made by talented community members.</p>
        </div>
        <div className="crafts-grid">
          <div className="craft-card">
            <div className="craft-image">📖</div>
            <div className="craft-details">
              <p className="craft-seller">by Priya S.</p>
              <h4>Hand-Painted Bookmarks (Set of 5)</h4>
              <div className="craft-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 75</span>
                <button className="wishlist-btn"><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
          <div className="craft-card">
            <div className="craft-image">🎴</div>
            <div className="craft-details">
              <p className="craft-seller">by Arjun K.</p>
              <h4>Origami Wall Art Set</h4>
              <div className="craft-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 120</span>
                <button className="wishlist-btn"><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
          <div className="craft-card">
            <div className="craft-image">📓</div>
            <div className="craft-details">
              <p className="craft-seller">by Meera L.</p>
              <h4>Recycled Paper Journal</h4>
              <div className="craft-price-row">
                <span className="bundle-price"><i className="fa-solid fa-coins"></i> 90</span>
                <button className="wishlist-btn"><i className="fa-regular fa-heart"></i></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="testimonials-header">
          <h2 className="section-title">What Our Readers Say</h2>
          <p className="section-subtitle" style={{margin: '0 auto'}}>Join thousands of happy book lovers and crafters.</p>
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

      {/* LEVELS */}
      <section className="levels">
        <h2 className="section-title">Level Up Your Reading</h2>
        <p className="section-subtitle" style={{margin: '0 auto'}}>Earn more benefits as you donate and engage.</p>
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
        <div style={{marginTop: 'var(--space-xl)', textAlign: 'center'}}>
          <p style={{color: 'var(--grey)', marginBottom: 'var(--space-xs)', fontSize: '14px'}}>📊 300 pts to Bibliophile</p>
          <div style={{background: 'var(--light-grey)', height: '8px', borderRadius: '4px', maxWidth: '300px', margin: '0 auto', overflow: 'hidden'}}>
            <div style={{background: 'var(--secondary)', height: '100%', width: '40%', borderRadius: '4px'}}></div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Ready to Give Your Books a New Story?</h2>
        <p>Join thousands of readers and crafters building a library without walls.</p>
        <Link to="/register" className="btn btn-lg">
          <i className="fa-solid fa-gift"></i> Sign Up Free — Earn 50 Bonus Points
        </Link>
        <p className="cta-note">No credit card. Just books and good vibes.</p>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">📚 Projenius</div>
            <p className="footer-about">Building a sustainable ecosystem to reduce book waste, promote literacy, and create a circular economy for books through donations and point-based exchanges.</p>
            <div className="social-links">
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#"><i className="fa-brands fa-twitter"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/donate">Donate Books</Link></li>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4>Staff & Admin</h4>
            <ul className="footer-links">
              <li><Link to="/login">Staff Portal</Link></li>
              <li><Link to="/admin">Admin Dashboard</Link></li>
              <li><a href="#">Documentation</a></li>
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
    </>
  );
}