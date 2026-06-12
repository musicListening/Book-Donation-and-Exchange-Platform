// client/src/pages/HomePage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

// Import Local Images
import bookStackImage from "../assets/book-stack.png";
import bundlesImage from "../assets/bundles-icon.png";
import craftsImage from "../assets/crafts-icon.png";
import progressImage from "../assets/progress-icon.png";
import bookIcon from "../assets/book-icon.png";
import rewardsIcon from "../assets/rewards-icon.png";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">PROJENIUS</span>
          </div>
          
          <div className="nav-menu">
            <Link to="/" className="nav-link active">HOME</Link>
            <Link to="/#how-it-works" className="nav-link">HOW IT WORKS</Link>
            <Link to="/marketplace" className="nav-link">MARKETPLACE</Link>
            <Link to="/#about" className="nav-link">ABOUT</Link>
            <Link to="/admin" className="nav-link" style={{ color: "#643C29", fontWeight: "bold", borderBottom: "1px dashed #643C29" }}>
              ⚙️ ADMIN CONSOLE
            </Link>
          </div>

          <div className="nav-search">
            <input
              type="text"
              placeholder="SEARCH BOOKS OR CRAFTS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">
              <span className="search-icon">🔍</span>
            </button>
          </div>

          <div className="nav-auth-buttons" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" className="nav-link" style={{ fontWeight: '600', color: '#1E4D4B' }}>
              Log In
            </Link>
            <Link to="/register" className="signup-btn" style={{ 
              padding: '8px 20px', 
              backgroundColor: '#1E4D4B', 
              color: 'white', 
              borderRadius: '6px', 
              textDecoration: 'none', 
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-split">
            <div className="hero-image">
              <img src={bookStackImage} alt="Stack of books" className="book-stack-img" />
            </div>

            <div className="hero-content">
              <h1 className="hero-title">
                Turn Your Shelves Into Points. <span className="highlight">Turn Points Into Treasures.</span>
              </h1>

              <p className="hero-description">
                Donate any genre of books, earn points instantly, and browse thousands of curated book bundles or handmade paper crafts. Join our sustainable reading revolution.
              </p>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-label" style={{ fontWeight: 'bold' }}>Free to join</span>
                </div>
                <div className="stat-item">
                  <img src={bookIcon} alt="Book" className="stat-image" />
                  <span className="stat-label">12,450+ Books Donated</span>
                </div>
                <div className="stat-item">
                  <img src={rewardsIcon} alt="Rewards" className="stat-image" />
                  <span className="stat-label">Instant Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">+50 pts Bonus</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🎨 Handmade Crafts</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                <Link to="/donate" className="donate-now-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                  START DONATING →
                </Link>
                <Link to="/marketplace" className="donate-now-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', backgroundColor: 'transparent', color: '#1E4D4B', border: '2px solid #1E4D4B' }}>
                  EXPLORE MARKETPLACE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats Bar */}
      <section className="features" style={{ backgroundColor: '#f4f1ea', padding: '40px 0' }}>
        <div className="features-container" style={{ justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          <div className="feature-card" style={{ textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <h3 className="feature-title" style={{ fontSize: '2rem', color: '#1E4D4B', marginBottom: '8px' }}>📦 12,450+</h3>
            <p className="feature-description" style={{ fontSize: '1.1rem' }}>Books Donated</p>
          </div>
          <div className="feature-card" style={{ textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <h3 className="feature-title" style={{ fontSize: '2rem', color: '#1E4D4B', marginBottom: '8px' }}>👥 3,800+</h3>
            <p className="feature-description" style={{ fontSize: '1.1rem' }}>Active Members</p>
          </div>
          <div className="feature-card" style={{ textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <h3 className="feature-title" style={{ fontSize: '2rem', color: '#1E4D4B', marginBottom: '8px' }}>🪙 1.2M+</h3>
            <p className="feature-description" style={{ fontSize: '1.1rem' }}>Points Earned</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How Projenius Works</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Four simple steps to turn your books into new adventures.</p>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-circle">1</div>
              <div className="step-icon">📅</div>
              <h3>Schedule Donation</h3>
              <p>Tell us what books you want to give and pick a drop-off date that works for you.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-circle">2</div>
              <div className="step-icon">⭐</div>
              <h3>Get Points</h3>
              <p>Staff verifies your books and credits points to your account instantly.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-circle">3</div>
              <div className="step-icon">🛒</div>
              <h3>Browse & Shop</h3>
              <p>Use points to grab curated book bundles or unique paper crafts.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-circle">4</div>
              <div className="step-icon">📦</div>
              <h3>Receive & Enjoy</h3>
              <p>We deliver right to your doorstep. Happy reading and crafting!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Genre */}
      <section className="categories" id="marketplace">
        <div className="container">
          <h2 className="section-title">Find Your Genre</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Browse thousands of books across every category imaginable.</p>

          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">📖</div>
              <h3>Fiction</h3>
              <p>Novels, Fantasy & more</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📚</div>
              <h3>Non-Fiction</h3>
              <p>Biographies, History & Essays</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🎓</div>
              <h3>Academic</h3>
              <p>Textbooks & Reference</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🧸</div>
              <h3>Children's</h3>
              <p>Picture books & YA</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🦸</div>
              <h3>Comics</h3>
              <p>Manga & Graphic Novels</p>
            </div>
            <div className="category-card">
              <div className="category-icon">💎</div>
              <h3>Rare Finds</h3>
              <p>Collectibles & Special Editions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff-Curated Bundles */}
      <section className="features" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <h2 className="section-title">🔥 Staff-Curated Bundles</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Handpicked collections by our expert staff.</p>
          
          <div className="categories-grid">
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">📚</div>
              <h3>Romance</h3>
              <p style={{ color: '#E9C46A', fontWeight: 'bold' }}>Only 3 left</p>
              <h4 style={{ margin: '10px 0' }}>Cozy Winter Reads</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Curated by: Anika</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>250 pts</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">🖋️</div>
              <h3>Self-Help</h3>
              <h4 style={{ margin: '10px 0' }}>Mindfulness Collection</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Curated by: Raj</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>180 pts</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">🔬</div>
              <h3>Educational</h3>
              <h4 style={{ margin: '10px 0' }}>Science Explorers Pack</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Curated by: Priya</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>320 pts</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">🎭</div>
              <h3>Classics</h3>
              <h4 style={{ margin: '10px 0' }}>Timeless Literature</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Curated by: David</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>400 pts</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Handmade Paper Creations */}
      <section className="how-it-works" style={{ backgroundColor: '#fff' }}>
        <div className="container">
          <h2 className="section-title">🎨 Handmade Paper Creations</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Unique crafts made by talented community members.</p>

          <div className="categories-grid">
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">📖</div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>by Priya S.</p>
              <h4 style={{ margin: '10px 0' }}>Hand-Painted Bookmarks (Set of 5)</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>75 🎴</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">🎴</div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>by Arjun K.</p>
              <h4 style={{ margin: '10px 0' }}>Origami Wall Art Set</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>120 🎴</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
            <div className="category-card" style={{ textAlign: 'left' }}>
              <div className="category-icon">📓</div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>by Meera L.</p>
              <h4 style={{ margin: '10px 0' }}>Recycled Paper Journal</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1E4D4B' }}>90 🎴</p>
              <Link to="/marketplace" className="donate-now-btn" style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', padding: '8px' }}>Add to Cart</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="how-it-works" style={{ backgroundColor: '#f4f1ea' }}>
        <div className="container">
          <h2 className="section-title">What Our Readers Say</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Join thousands of happy book lovers and crafters.</p>

          <div className="steps-container" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="step-card" style={{ maxWidth: '350px' }}>
              <div className="step-icon" style={{ fontSize: '2rem' }}>👩</div>
              <h3>Ananya S.</h3>
              <p style={{ fontStyle: 'italic', color: '#555' }}>"I decluttered my shelf and got enough points to buy a rare poetry bundle. This is genius!"</p>
              <span className="step-points">Donated 45 books ★★★★★</span>
            </div>
            <div className="step-card" style={{ maxWidth: '350px' }}>
              <div className="step-icon" style={{ fontSize: '2rem' }}>👨</div>
              <h3>Vikram R.</h3>
              <p style={{ fontStyle: 'italic', color: '#555' }}>"Selling my paper crafts here connected me with readers who truly appreciate handmade art."</p>
              <span className="step-points">Craft Seller ★★★★★</span>
            </div>
            <div className="step-card" style={{ maxWidth: '350px' }}>
              <div className="step-icon" style={{ fontSize: '2rem' }}>👩‍🎓</div>
              <h3>Fatima K.</h3>
              <p style={{ fontStyle: 'italic', color: '#555' }}>"As a student, being able to exchange textbooks for points is a lifesaver. Highly recommend!"</p>
              <span className="step-points">Student ★★★★★</span>
            </div>
          </div>
        </div>
      </section>

      {/* Level Up Tiers Detail */}
      <section className="categories" id="points">
        <div className="container">
          <h2 className="section-title">Level Up Your Reading</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666', fontSize: '1.1rem' }}>Earn more benefits as you donate and engage.</p>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">📚</div>
              <h3>Book Lover</h3>
              <p style={{ fontWeight: 'bold', color: '#1E4D4B' }}>0 — 250 Points</p>
              <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '0.9rem', color: '#555', lineHeight: '1.6' }}>
                <li>Early bundle access</li>
                <li>Profile badge</li>
                <li>Standard delivery</li>
              </ul>
            </div>
            <div className="category-card">
              <div className="category-icon">🥇</div>
              <h3>Bibliophile</h3>
              <p style={{ fontWeight: 'bold', color: '#1E4D4B' }}>251 — 750 Points</p>
              <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '0.9rem', color: '#555', lineHeight: '1.6' }}>
                <li>+10% bonus points on donations</li>
                <li>Priority support</li>
                <li>Exclusive bundles</li>
                <li>Free shipping on orders over 200 pts</li>
              </ul>
            </div>
            <div className="category-card">
              <div className="category-icon">💎</div>
              <h3>Grand Librarian</h3>
              <p style={{ fontWeight: 'bold', color: '#1E4D4B' }}>751+ Points</p>
              <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '0.9rem', color: '#555', lineHeight: '1.6' }}>
                <li>+20% bonus points on donations</li>
                <li>Free delivery always</li>
                <li>Custom profile frame</li>
                <li>Early access to all new arrivals</li>
                <li>VIP support line</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="about">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Give Your Books a New Story?</h2>
            <p>Join thousands of readers and crafters building a library without walls.</p>
            <Link to="/register" className="cta-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Sign Up Free — Earn 50 Bonus Points →
            </Link>
            <p style={{ marginTop: '16px', fontSize: '0.9rem', opacity: 0.8 }}>No credit card. Just books and good vibes.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <span className="logo-icon">📚</span>
            <span>PROJENIUS</span>
            <p style={{ marginTop: '12px', maxWidth: '300px' }}>Building a sustainable ecosystem to reduce book waste, promote literacy, and create a circular economy for books through donations and point-based exchanges.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <Link to="/donate">Donate Books</Link>
              <Link to="/marketplace">Marketplace</Link>
              <a href="#how-it-works">How It Works</a>
              <a href="#faqs">FAQs</a>
            </div>

            <div className="footer-column">
              <h4>Staff & Admin</h4>
              <Link to="/staff-login">Staff Portal</Link>
              <Link to="/admin">Admin Dashboard</Link>
              <a href="#docs">Documentation</a>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <a href="mailto:hello@projenius.com">hello@projenius.com</a>
              <a href="tel:+919876543210">+91 98765 43210</a>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Bangalore, India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Projenius. Built with ❤️ for book lovers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}